var ndarray = require('ndarray')
var createTexture = require('gl-texture2d');
var show = require('ndarray-show');

module.exports = Scene;

// TODO: add vert/frag
function Scene(gl, vert, frag) {
  this.vert = vert;
  this.frag = frag;

  this.gl = gl;
  // this.shader = this.createShader(gl);

  this.variableMapSize = 8;

  this.ops = ndarray(
    new Float32Array(this.variableMapSize*this.variableMapSize),
    [this.variableMapSize, this.variableMapSize]
  );

  this.pointer = [0,0];
  this.opsTexture = createTexture(gl, this.ops);
  this.shapes = [];
}

Scene.prototype.alloc = function() {
  var x = this.pointer[0];
  var y = this.pointer[1];

  if (x > this.variableMapSize) {
    x=0;
    y++;
  }

  if (y > this.variableMapSize) {
    throw new Error('ENOMEM');
  }

  this.pointer[0] = x + 1;
  this.pointer[1] = y;

  var ops = this.ops;
  return function getset(v) {
    if (typeof v !== 'undefined') {
      ops.set(x, y, v);

      console.log(show(ops));

      return v;
    }

    return ops.get(x, y);
  }
}


Scene.prototype.createCircle = function(x, y, radius, color) {
  var _x = this.alloc();
  var _y = this.alloc();
  var _r = this.alloc();

  // this will eat up 3 spaces in the ops buffer
  var circle = {
    radius: _r,
    0: _x,
    1: _y
  };

  _x(x);
  _y(x);
  _r(radius);

  return circle;
}

Scene.prototype.add = function addShape(thing) {
  this.shapes.push(thing)
}

Scene.prototype.render = function renderScene() {

  // TODO: only upload changes
  this.opsTexture.setPixels(this.ops);
}
