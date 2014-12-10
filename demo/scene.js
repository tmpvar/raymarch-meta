var createShader = require('gl-shader-core');

var ndarray = require('ndarray')
var createTexture = require('gl-texture2d');
var show = require('ndarray-show');
var printf = require('printf');
var aabb = require('./aabb');

var min = Math.min;
var max = Math.max;

module.exports = Scene;

// TODO: add vert/frag
function Scene(gl, vert, frag) {
  this.vert = vert;
  this.frag = frag;

  this.gl = gl;
  // this.shader = this.createShader(gl);

  this.raymarch = {
    CYCLES: 128
  };

  this.variableMapSize = 16;

  this.ops = ndarray(
    new Float32Array(this.variableMapSize*this.variableMapSize),
    [this.variableMapSize, this.variableMapSize]
  );

  this.pointer = [0,0];
  this.opsTexture = createTexture(gl, this.ops);
  this.shapes = [];

  this.scale = [1,1,1];

  this.prefetchCommands = [];

  this.vertSource = vert;
  this.fragSource = frag;
  this.shader = this.createShader();

  this._bounds = [[0, 0, 0], [0, 0, 0]];
  this.dirtyBounds = false;
}

Scene.prototype.createShader = function() {
  this.dirty = true;
  if (this.shader) {
    this.shader.dispose();
  }

  var shapes = this.shapes;
  var l = shapes.length;
  var shapeStr = '';
  var prefetchStr = '';

  for (var i=0; i<l; i++) {
    console.log('shapes[' + i + '].prefetchCode: ' + shapes[i].prefetchCode);
    if ('undefined' !== typeof shapes[i].prefetchCode) { // XXX: awful hack! we probably want to use a different loop counter and test here
      prefetchStr += shapes[i].prefetchCode;
    }

    console.log('shapes[' + i + '].code: ' + shapes[i].code);

    shapeStr += shapes[i].code;
  }

  console.log("prefetchStr:", prefetchStr);

  var frag = this.fragSource.replace('/* RAYMARCH_SETUP */', prefetchStr);
  frag = frag.replace('/* RAYMARCH_OPS */', shapeStr);
  frag = frag.replace(/\/\* OPS_SIZE \*\//g, this.variableMapSize.toFixed(1));

  var raymarchDefines = this.raymarch;
  Object.keys(raymarchDefines).forEach(function(key) {
    var exp = new RegExp('\\/\\* RAYMARCH_' + key + ' \\*\\/', 'g');
    frag = frag.replace(exp, raymarchDefines[key]);
  });

  console.log('frag:', frag);

  this.shader = createShader(
    this.gl,
    this.vertSource,
    frag,
    [
      { name: 'worldToClip', type: 'mat4' },
      { name: 'clipToWorld', type: 'mat4' },
      { name: 'ops', type: 'sampler2D' },
      { name: 'camera_eye', type: 'vec3' },
      { name: 'resolution', type: 'vec2' },
      { name: 'time', type: 'float' },

    ],
    [{ name: 'position', type: 'vec3' }]
  );

  return this.shader;
}

Scene.prototype.alloc = function() {
  var x = this.pointer[0];
  var y = this.pointer[1];

  if (x >= this.variableMapSize) {
    x=0;
    y++;
  }

  if (y > this.variableMapSize) {
    throw new Error('ENOMEM');
  }

  this.pointer[0] = x + 1;
  this.pointer[1] = y;

  var ops = this.ops;
  var scene = this;
  function getset(v) {
    if (typeof v !== 'undefined') {
      scene.dirty = true;
      ops.set(x, y, v);
      return v;
    }

    return ops.get(x, y);
  }

  getset.position = [x, y];

  return getset;
}


Scene.prototype.dirty = false;
Scene.prototype.shapeId = 0;
Scene.prototype.createSphere = function(x, y, z, radius, color) {
  var _x = this.alloc();
  var _y = this.alloc();
  var _z = this.alloc();
  var _r = this.alloc();

  // this will eat up 4 spaces in the ops buffer
  var sphere = {
    radius: _r,
    0: _x,
    1: _y,
    2: _z
  };

  Object.defineProperty(sphere, 'prefetchCode', {
    value: printf(
      '  float Xpf_%i = sample(%i, %i);\n',
      this.shapeId,
      _x.position[0].toFixed(1),
      _x.position[1].toFixed(1))

    + printf(
      '  float Ypf_%i = sample(%i, %i);\n',
      this.shapeId,
      _y.position[0].toFixed(1),
      _y.position[1].toFixed(1))

    + printf(
      '  float Zpf_%i = sample(%i, %i);\n',
      this.shapeId,
      _z.position[0].toFixed(1),
      _z.position[1].toFixed(1))

    + printf(
      '  float Rpf_%i = sample(%i, %i);\n',
      this.shapeId,
      _r.position[0].toFixed(1),
      _r.position[1].toFixed(1))
  });

  Object.defineProperty(sphere, 'name', {
    value: 'sphere_' + (this.shapeId++)
  });

  Object.defineProperty(sphere, 'bounds', {
    get: function() {
      var x = _x();
      var y = _y();
      var z = _z();
      var r = _r();

      return [
        [x - r, y - r, z -r],
        [x + r, y + r, z + r]
      ];
    }
  });

  Object.defineProperty(sphere, 'code', {
    value: printf(
      '    float %s = solid_sphere(position - vec3(Xpf_%i, Ypf_%i, Zpf_%i), Rpf_%i);\n',
      sphere.name,
      this.shapeId - 1,
      this.shapeId - 1,
      this.shapeId - 1,
      this.shapeId - 1
    )
  });

  _x(x);
  _y(y);
  _z(z);
  _r(radius);

  return sphere;
}

Scene.prototype.createBox = function(x, y, z, width, height, depth, color) {
  var _x = this.alloc();
  var _y = this.alloc();
  var _z = this.alloc();
  var _w = this.alloc();
  var _h = this.alloc();
  var _d = this.alloc();

  // this will eat up 6 spaces in the ops buffer
  var box = {
    0: _x,
    1: _y,
    2: _z,
    3: _w,
    4: _h,
    5: _d
  };

  Object.defineProperty(box, 'prefetchCode', {
    value: printf(
      '  float Xpf_%i = sample(%i, %i);\n',
      this.shapeId,
      _x.position[0].toFixed(1),
      _x.position[1].toFixed(1))

    + printf(
      '  float Ypf_%i = sample(%i, %i);\n',
      this.shapeId,
      _y.position[0].toFixed(1),
      _y.position[1].toFixed(1))

    + printf(
      '  float Zpf_%i = sample(%i, %i);\n',
      this.shapeId,
      _z.position[0].toFixed(1),
      _z.position[1].toFixed(1))

    + printf(
      '  float Wpf_%i = sample(%i, %i);\n',
      this.shapeId,
      _w.position[0].toFixed(1),
      _w.position[1].toFixed(1))

    + printf(
      '  float Hpf_%i = sample(%i, %i);\n',
      this.shapeId,
      _h.position[0].toFixed(1),
      _h.position[1].toFixed(1))

    + printf(
      '  float Dpf_%i = sample(%i, %i);\n',
      this.shapeId,
      _d.position[0].toFixed(1),
      _d.position[1].toFixed(1))
  });

  Object.defineProperty(box, 'name', {
    value: 'box_' + (this.shapeId++)
  });

  Object.defineProperty(box, 'bounds', {
    get: function() {
      var x = _x();
      var y = _y();
      var z = _z();
      var w = _w();
      var h = _h();
      var d = _d();

      return [
        [x, y, z],
        [x + w, y + h, z + d]
      ];
    }
  });

  Object.defineProperty(box, 'code', {
    value: printf(
      '    float %s = signed_box_distance(position - vec3(Xpf_%i, Ypf_%i, Zpf_%i), vec3(Wpf_%i, Hpf_%i, Dpf_%i) );\n',
      box.name,
      this.shapeId - 1,
      this.shapeId - 1,
      this.shapeId - 1,
      this.shapeId - 1,
      this.shapeId - 1,
      this.shapeId - 1
    )
  });

  _x(x);
  _y(y);
  _z(z);
  _w(width);
  _h(height);
  _d(depth);

  return box;
}

Scene.prototype.createCappedCylinder = function(x, y, z, radius, height, color) {
  var _x = this.alloc();
  var _y = this.alloc();
  var _z = this.alloc();
  var _r = this.alloc();
  var _h = this.alloc();

  var cappedcyl = {
    0: _x,
    1: _y,
    2: _z,
    3: _r,
    4: _h
  };

  Object.defineProperty(cappedcyl, 'prefetchCode', {
    value: printf(
      '  float Xpf_%i = sample(%i, %i);\n',
      this.shapeId,
      _x.position[0].toFixed(1),
      _x.position[1].toFixed(1))

    + printf(
      '  float Ypf_%i = sample(%i, %i);\n',
      this.shapeId,
      _y.position[0].toFixed(1),
      _y.position[1].toFixed(1))

    + printf(
      '  float Zpf_%i = sample(%i, %i);\n',
      this.shapeId,
      _z.position[0].toFixed(1),
      _z.position[1].toFixed(1))

    + printf(
      '  float Rpf_%i = sample(%i, %i);\n',
      this.shapeId,
      _r.position[0].toFixed(1),
      _r.position[1].toFixed(1))

    + printf(
      '  float Hpf_%i = sample(%i, %i);\n',
      this.shapeId,
      _h.position[0].toFixed(1),
      _h.position[1].toFixed(1))
  });

  Object.defineProperty(cappedcyl, 'name', {
    value: 'cappedcyl_' + (this.shapeId++)
  });


  Object.defineProperty(cappedcyl, 'bounds', {
    get: function() {
      var r = _r();
      var x = _x();
      var y = _y();
      var z = _z();
      var h = _h();


      return [
        [x - r, y - h, z - r],
        [x + r, y + h, z + r]
      ];
    }
  });

  Object.defineProperty(cappedcyl, 'code', {
    value: printf(
      '    float %s = solid_capped_cylinder(position - vec3(Xpf_%i, Ypf_%i, Zpf_%i), vec2(Rpf_%i, Hpf_%i) );\n',
      cappedcyl.name,
      this.shapeId - 1,
      this.shapeId - 1,
      this.shapeId - 1,
      this.shapeId - 1,
      this.shapeId - 1
    )
  });

  _x(x);
  _y(y);
  _z(z);
  _r(radius);
  _h(height);

  return cappedcyl;
}

Scene.prototype.createTorus = function(x, y, z, radiusMajor, radiusMinor, color) {
  var _x = this.alloc();
  var _y = this.alloc();
  var _z = this.alloc();
  var _R = this.alloc();
  var _r = this.alloc();

  var torus = {
    0: _x,
    1: _y,
    2: _z,
    3: _R,
    4: _r
  };

  Object.defineProperty(torus, 'prefetchCode', {
    value: printf(
      '  float Xpf_%i = sample(%i, %i);\n',
      this.shapeId,
      _x.position[0].toFixed(1),
      _x.position[1].toFixed(1))

    + printf(
      '  float Ypf_%i = sample(%i, %i);\n',
      this.shapeId,
      _y.position[0].toFixed(1),
      _y.position[1].toFixed(1))

    + printf(
      '  float Zpf_%i = sample(%i, %i);\n',
      this.shapeId,
      _z.position[0].toFixed(1),
      _z.position[1].toFixed(1))

    + printf(
      '  float Rpf_%i = sample(%i, %i);\n',
      this.shapeId,
      _R.position[0].toFixed(1),
      _R.position[1].toFixed(1))

    + printf(
      '  float rpf_%i = sample(%i, %i);\n',
      this.shapeId,
      _r.position[0].toFixed(1),
      _r.position[1].toFixed(1))
  });

  Object.defineProperty(torus, 'name', {
    value: 'torus_' + (this.shapeId++)
  });

  Object.defineProperty(torus, 'bounds', {
    get: function() {

      // compute the extent
      var rminor = _r();
      var rmajor = _R();
      // horizontal radius (overall)
      var hr = rmajor+ rminor;

      var x = _x();
      var y = _y();
      var z = _z();

      return [
        [x - hr, y - rminor, z - hr],
        [x + hr, y + rminor, z + hr]
      ];
    }
  });

  Object.defineProperty(torus, 'code', {
    value: printf(
      '    float %s = solid_torus(position - vec3(Xpf_%i, Ypf_%i, Zpf_%i), vec2(Rpf_%i, rpf_%i) );\n',
      torus.name,
      this.shapeId - 1,
      this.shapeId - 1,
      this.shapeId - 1,
      this.shapeId - 1,
      this.shapeId - 1
    )
  });

  _x(x);
  _y(y);
  _z(z);
  _R(radiusMajor);
  _r(radiusMinor);

  return torus;
}

Scene.prototype.createTriangle = function(a, b, c) {

  var triangle = {
    points : [],
    shapeId: this.shapeId++
  };

  Object.defineProperty(triangle, 'name', {
    value: 'triangle_' + triangle.shapeId
  });

  var bounds = aabb.create();

  Object.defineProperty(triangle, 'bounds', {
    get: function() {
      aabb.update(a, bounds);
      aabb.update(b, bounds);
      aabb.update(c, bounds);
      return [[-1, -1, -1], [1, 1, 1]];
    }
  });

  var scene = this;
  Object.defineProperty(triangle, 'prefetchCode', {
    value: [a, b, c].map(function(point, i) {
      var _x = scene.alloc();
      var _y = scene.alloc();
      var _z = scene.alloc();

      _x(point[0]);
      _y(point[1]);
      _z(point[2] || 0);

      triangle.points.push([_x, _y, _z]);

      return printf(
      '  vec3 triangle_%i_%i = vec3(sample(%i, %i), sample(%i, %i), sample(%i, %i));\n',
      triangle.shapeId,
      i,
      _x.position[0].toFixed(1),
      _x.position[1].toFixed(1),
      _y.position[0].toFixed(1),
      _y.position[1].toFixed(1),
      _z.position[0].toFixed(1),
      _z.position[1].toFixed(1))
    }).join('\n')
  });

  console.log(triangle.prefetchCode)

  Object.defineProperty(triangle, 'code', {
    value: printf(
      '    float %s = solid_triangle(position, triangle_%i_0, triangle_%i_1, triangle_%i_2);\n',
      triangle.name,
      triangle.shapeId,
      triangle.shapeId,
      triangle.shapeId
    )
  });

  return triangle;
};

// TODO: compute new bounding box, of incoming bounding boxes
Scene.prototype.createUnion = function(shapes) {
  if (!Array.isArray(shapes)) {
    shapes = [shapes];
  }

  var union = {};

  Object.defineProperty(union, 'name', {
    value: 'union_' + (this.shapeId++)
  });

  Object.defineProperty(union, 'bounds', {
    get: function getUnionBounds() {
      return aabb.merge(shapes.map(function(shape) { return shape.bounds }));
    }
  });

  shapes = shapes.filter(function(shape) {
    return !!shape.name;
  });

  var first = shapes.shift();

  Object.defineProperty(union, 'code', {
    value : '    float ' + union.name + ' = ' + first.name + ';\n' + shapes.map(function(shape) {
      if (!shape.name) { return false; }
      return '    ' + union.name + ' =  min(' + union.name + ', ' + shape.name + ');';
    }).filter(Boolean).join('\n') + '\n'
  });

  return union;
}

Scene.prototype.createCut = function(shapes) {
  if (!Array.isArray(shapes)) {
    shapes = [shapes];
  }

  // NOTE: as of right today 12/9/2014, I don't think there
  //       is a reason to include bounds here.  This may result
  //       in a less than optimal bounding box overall, but
  //       it will likely be more robust.
  //
  //       will revisit if struck by a bolt of inspiration

  var cut = {};

  shapes = shapes.filter(function(shape) {
    return !!shape.name;
  });

  var first = shapes.shift();

  Object.defineProperty(cut, 'name', {
    value: 'cut_' + (this.shapeId++)
  });

  Object.defineProperty(cut, 'code', {
    value : '    float ' + cut.name + ' = ' + first.name + ';\n' + shapes.map(function(shape) {
      if (!shape.name) { return false}
      return '    ' + cut.name + ' =  max(-' + cut.name + ', ' + shape.name + ');';
    }).filter(Boolean).join('\n') + '\n'
  });

  return cut;
}



Scene.prototype.getAABB = function() {
  if (this.dirtyBounds) {
    var bounds = this._bounds;
    var shapes = this.shapes;

    bounds[0][0] = Infinity;
    bounds[0][1] = Infinity;
    bounds[0][2] = Infinity;

    bounds[1][1] = -Infinity;
    bounds[1][0] = -Infinity;
    bounds[1][2] = -Infinity;

    for (var i=0; i<shapes.length; i++) {
      var sbounds = shapes[i].bounds;
      if (!sbounds) {
        continue;
      }

      bounds[0][0] = min(sbounds[0][0], bounds[0][0]);
      bounds[0][1] = min(sbounds[0][1], bounds[0][1]);
      bounds[0][2] = min(sbounds[0][2], bounds[0][2]);

      bounds[1][0] = max(sbounds[1][0], bounds[1][0]);
      bounds[1][1] = max(sbounds[1][1], bounds[1][1]);
      bounds[1][2] = max(sbounds[1][2], bounds[1][2]);
    }

    this.dirtyBounds = false;
  }
  return this._bounds;
}

Scene.prototype.createDisplay = function(shapes) {
  if (!Array.isArray(shapes)) {
    shapes = [shapes];
  }
  var display = {};

  Object.defineProperty(display, 'code', {
    value : shapes.map(function(shape) {
      if (!shape.name) { return false; }
      return '    h = min(h, ' + shape.name + ');';
    }).filter(Boolean).join('\n') + '\n'
  });

  return display;
}

Scene.prototype.add = function addShape(thing) {
  this.dirtyBounds = true;
  this.getAABB();

  this.shapes.push(thing)

  this.createShader();
}

Scene.prototype.render = function renderScene() {

  if (this.dirty) {
    console.log('dirty');
    // TODO: only upload changes
    this.opsTexture.setPixels(this.ops);
    this.dirty = false;
  }
}
