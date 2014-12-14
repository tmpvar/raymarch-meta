var createShader = require('gl-shader-core');
var vec3 = require('gl-vec3');
var ndarray = require('ndarray');
var createTexture = require('gl-texture2d');
var show = require('ndarray-show');
var printf = require('printf');
var aabb = require('./util/aabb');
var Sphere = require('./shape/sphere');
var Cuboid = require('./shape/cuboid');
var CappedCylinder = require('./shape/capped-cylinder');
var Union = require('./shape/op/union');
var Cut = require('./shape/op/cut');
var Torus = require('./shape/torus');

var min = Math.min;
var max = Math.max;

module.exports = Scene;

// TODO: add vert/frag
function Scene(gl, vert, frag) {
  this.vert = vert;
  this.frag = frag;

  this.gl = gl;

  this.raymarch = {
    CYCLES: 128
  };

  this.variableMapSize = 16;

  this.ops = ndarray(
    new Float32Array(this.variableMapSize*this.variableMapSize),
    [this.variableMapSize, this.variableMapSize]
  );

  this.pointer = [0,0];

  this.shapes = [];

  this.scale = [1,1,1];

  this.prefetchCommands = [];

  this.vertSource = vert;
  this.fragSource = frag;

  this._bounds = [[0, 0, 0], [0, 0, 0]];
  this.dirtyBounds = false;
  this.viewport = [0, 0, 300, 200];

  this.initGL(gl);
}

Scene.prototype.initGL = function initializeGL(gl) {
  this.opsTexture = createTexture(gl, this.ops);
  this.shader = this.createShader();
}

var v3temp = [0, 0, 0];
Scene.prototype.march = function(rayOrigin, rayDirection) {
  var rayPosition = vec3.clone(rayOrigin);

  // attempt a march
  var dist = 0;

  var shapes = this.shapes.filter(function(shape) {
    return !!shape.evaluateVec3
  });

  var l = shapes.length;
  var eps = 1/this.raymarch.CYCLES;
  for (var step = 0; step<this.raymarch.CYCLES; step++) {

    var h = Infinity;
    for (var i=0; i<l; i++) {
      h = min(h, shapes[i].evaluateVec3(rayPosition));

      if (h<eps) {
        break;
      }
    }

    if (h < eps) {
      console.log('hit on shape %i (%f)', i, dist, shapes[i])
      break;
    }

    dist += h;
    v3temp[0] = rayDirection[0] * dist;
    v3temp[1] = rayDirection[1] * dist;
    v3temp[2] = rayDirection[2] * dist;

    vec3.add(rayPosition, v3temp, rayOrigin);
  }
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
    console.log('shapes[' + i + '].code: ' + shapes[i].code);

    prefetchStr += shapes[i].prefetchCode;
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

Scene.prototype.alloc = function(value, multiplier) {
  var x = this.pointer[0];
  var y = this.pointer[1];

  multiplier = multiplier || 1;

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
      value = v;
      ops.set(x, y, v * multiplier);
      return v;
    }

    return ops.get(x, y);
  }

  if (typeof value !== 'undefined') {
    getset(value);
  }

  getset.position = [x, y];

  // allow normal operators to work
  // e.g. scene.alloc(8) + 1 === 9
  getset.valueOf = function() {
    return value;
  };

  getset.toString = function() {
    return value + '';
  }

  return getset;
}

Scene.prototype.dirty = false;
Scene.prototype.shapeId = 0;
Scene.prototype.createSphere = function createSphere(x, y, z, radius) {
  return new Sphere(
    this.alloc(x),
    this.alloc(y),
    this.alloc(z),
    this.alloc(radius)
  );
};

Scene.prototype.createCuboid = function createCuboid(x, y, z, width, height, depth) {
  return new Cuboid([
    this.alloc(x),
    this.alloc(y),
    this.alloc(z)
  ],
  [
    this.alloc(width, 0.5),
    this.alloc(height, 0.5),
    this.alloc(depth, 0.5),
  ]);
};

Scene.prototype.createCappedCylinder = function(x, y, z, radius, height) {
  return new CappedCylinder(
    this.alloc(x),
    this.alloc(y),
    this.alloc(z),
    this.alloc(radius),
    this.alloc(height)
  );
};

Scene.prototype.createTorus = function(x, y, z, radiusMajor, radiusMinor, color) {
  return new Torus(
    this.alloc(x),
    this.alloc(y),
    this.alloc(z),
    this.alloc(radiusMajor),
    this.alloc(radiusMinor)
  );
};

Scene.prototype.createUnion = function(shapes) {
  return new Union(shapes);
}

Scene.prototype.createCut = function(target, cutters) {
  return new Cut(target, cutters);
};

Scene.prototype.getAABB = function() {
  if (this.dirtyBounds) {
    var bounds = this._bounds;
    var shapes = this.shapes;
    aabb.initialize(bounds);

    for (var i=0; i<shapes.length; i++) {
      var sbounds = shapes[i].bounds;
      if (!sbounds) {
        continue;
      }
      aabb.update(bounds, sbounds[0]);
      aabb.update(bounds, sbounds[1]);
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


  Object.defineProperty(display, 'prefetchCode', {
    value: ''
  });

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
