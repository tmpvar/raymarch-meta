var define = require('./define');
var varags = require('varargs');
module.exports = Mat4;


function Mat4(a) {
  var l = a.length;

  // allow this to be used with gl-mat4
  for (var i=0; i<l; i++) {
    define(this, i + '', a[i]);
  }
}

Mat4.prototype.length = 16;
