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
Scene.prototype.createCircle = function(x, y, radius, color) {
  var _x = this.alloc();
  var _y = this.alloc();
  var _r = this.alloc();

  // this will eat up 3 spaces in the ops buffer
  var circle = {
    radius: _r,
    0: _x,
    1: _y,
  };

  Object.defineProperty(circle, 'code', {
    value: printf(
      '  circle(vec2(sample(%i, %i), sample(%i, %i)), sample(%i, %i), dist);\n',
      _x.position[0].toFixed(1),
      _x.position[1].toFixed(1),
      _y.position[0].toFixed(1),
      _y.position[1].toFixed(1),
      _r.position[0].toFixed(1),
      _r.position[1].toFixed(1)
    )
  });

  _x(x);
  _y(y);
  _r(radius);

  return circle;
}

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

  Object.defineProperty(sphere, 'code', {
    value: printf(
      '  h = min(h, solid_sphere(vec3(sample(%i, %i), sample(%i, %i), sample(%i, %i)), sample(%i, %i)));',
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
