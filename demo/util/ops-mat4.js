var mat4 = require('gl-mat4')
var define = require('./define');
var varags = require('varargs');
module.exports = Mat4;


function Mat4(a) {
  a = a || mat4.create();
  // allow this to be used with gl-mat4
  for (var i=0; i<16; i++) {
    define(this, i, a[i] || 0);
  }
}

Mat4.prototype.length = 16;

Mat4.prototype.toString = function() {
  return mat4.str(this);
};
