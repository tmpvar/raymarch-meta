var createShader = require('gl-shader-core');

var ndarray = require('ndarray')
var createTexture = require('gl-texture2d');
var show = require('ndarray-show');
var printf = require('printf');

module.exports = Scene;

// TODO: add vert/frag
function Scene(gl, vert, frag) {
  this.vert = vert;
  this.frag = frag;

  this.gl = gl;
  // this.shader = this.createShader(gl);

  this.raymarch = {
    CYCLES: 256
  };

  this.variableMapSize = 16;

  this.ops = ndarray(
    new Float32Array(this.variableMapSize*this.variableMapSize),
    [this.variableMapSize, this.variableMapSize]
  );

  this.pointer = [0,0];
  this.opsTexture = createTexture(gl, this.ops);
  this.shapes = [];

  this.vertSource = vert;
  this.fragSource = frag;

  this.shader = this.createShader();
}

Scene.prototype.createShader = function() {
  this.dirty = true;
  if (this.shader) {
    this.shader.dispose();
  }

  var shapes = this.shapes;
  var l = shapes.length;
  var shapeStr = ''
  for (var i=0; i<l; i++) {
    console.log(shapes[i].code);
    shapeStr += shapes[i].code;
  }

  var frag = this.fragSource.replace('/* RAYMARCH_OPS */', shapeStr);
  frag = frag.replace(/\/\* OPS_SIZE \*\//g, this.variableMapSize.toFixed(1));

  var raymarchDefines = this.raymarch;
  Object.keys(raymarchDefines).forEach(function(key) {
    var exp = new RegExp('\\/\\* RAYMARCH_' + key + ' \\*\\/', 'g');
    frag = frag.replace(exp, raymarchDefines[key]);
  });

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

  Object.defineProperty(sphere, 'name', {
    value: 'sphere_' + (this.shapeId++)
  });

  Object.defineProperty(sphere, 'bounds', {
    value: function() {
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
      '    float %s = solid_sphere(position - vec3(sample(%i, %i), sample(%i, %i), sample(%i, %i)), sample(%i, %i));\n',
      sphere.name,
      _x.position[0].toFixed(1),
      _x.position[1].toFixed(1),
      _y.position[0].toFixed(1),
      _y.position[1].toFixed(1),
      _z.position[0].toFixed(1),
      _z.position[1].toFixed(1),
      _r.position[0].toFixed(1),
      _r.position[1].toFixed(1)
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

  Object.defineProperty(box, 'name', {
    value: 'box_' + (this.shapeId++)
  });

  Object.defineProperty(box, 'bounds', {
    value: function() {
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
      '    float %s = signed_box_distance(position - vec3(sample(%i, %i), sample(%i, %i), sample(%i, %i)), vec3(sample(%i, %i), sample(%i, %i), sample(%i, %i)) );\n',
      box.name,
      _x.position[0].toFixed(1),
      _x.position[1].toFixed(1),
      _y.position[0].toFixed(1),
      _y.position[1].toFixed(1),
      _z.position[0].toFixed(1),
      _z.position[1].toFixed(1),
      _w.position[0].toFixed(1),
      _w.position[1].toFixed(1),
      _h.position[0].toFixed(1),
      _h.position[1].toFixed(1),
      _d.position[0].toFixed(1),
      _d.position[1].toFixed(1)
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

  Object.defineProperty(cappedcyl, 'name', {
    value: 'cappedcyl_' + (this.shapeId++)
  });


  Object.defineProperty(cappedcyl, 'bounds', {
    value: function() {
      var r = _r();
      var x = _x();
      var y = _y();
      var z = _z();
      var h = _h()/2;
      var r2 = r*2;

      return [
        [x - r, y - h, z - r],
        [x + r, y + h, z + r]
      ];
    }
  });

  Object.defineProperty(cappedcyl, 'code', {
    value: printf(
      '    float %s = solid_capped_cylinder(position - vec3(sample(%i, %i), sample(%i, %i), sample(%i, %i)), vec2(sample(%i, %i), sample(%i, %i)) );\n',
      cappedcyl.name,
      _x.position[0].toFixed(1),
      _x.position[1].toFixed(1),
      _y.position[0].toFixed(1),
      _y.position[1].toFixed(1),
      _z.position[0].toFixed(1),
      _z.position[1].toFixed(1),
      _r.position[0].toFixed(1),
      _r.position[1].toFixed(1),
      _h.position[0].toFixed(1),
      _h.position[1].toFixed(1)
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

  Object.defineProperty(torus, 'name', {
    value: 'torus_' + (this.shapeId++)
  });

  Object.defineProperty(torus, 'bounds', {
    value: function() {

      // compute the extent
      var rminor = _r();
      var rmajor = _R();
      // horizontal radius (overall)
      var hr = _R() + _r();

      var x = _x();
      var y = _y();
      var z = _z();

      return [
        [x - hr, y - r, z - hr],
        [x + hr, y + r, z + hr]
      ];
    }
  });

  Object.defineProperty(torus, 'code', {
    value: printf(
      '    float %s = solid_torus(position - vec3(sample(%i, %i), sample(%i, %i), sample(%i, %i)), vec2(sample(%i, %i), sample(%i, %i)) );\n',
      torus.name,
      _x.position[0].toFixed(1),
      _x.position[1].toFixed(1),
      _y.position[0].toFixed(1),
      _y.position[1].toFixed(1),
      _z.position[0].toFixed(1),
      _z.position[1].toFixed(1),
      _R.position[0].toFixed(1),
      _R.position[1].toFixed(1),
      _r.position[0].toFixed(1),
      _r.position[1].toFixed(1)
    )
  });

  _x(x);
  _y(y);
  _z(z);
  _R(radiusMajor);
  _r(radiusMinor);

  return torus;
}

// TODO: compute new bounding box, of incoming bounding boxes
Scene.prototype.createUnion = function(shapes) {
  if (!Array.isArray(shapes)) {
    shapes = [shapes];
  }

  var union = {};

  Object.defineProperty(union, 'name', {
    value: 'union_' + (this.shapeId++)
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

// TODO: compute new bounding box based on what is being removed
Scene.prototype.createCut = function(shapes) {
  if (!Array.isArray(shapes)) {
    shapes = [shapes];
  }

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

Scene.prototype.createDisplay = function(shapes) {
  if (!Array.isArray(shapes)) {
    shapes = [shapes];
  }
  var display = {};
  Object.defineProperty(display, 'code', {
    value : shapes.map(function(shape) {
      if (!shape.name) { return false}
      return '    h = min(h, ' + shape.name + ');';
    }).filter(Boolean).join('\n') + '\n'
  });
  return display;
}

Scene.prototype.add = function addShape(thing) {
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
