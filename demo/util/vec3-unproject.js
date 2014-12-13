var mat4 = require('gl-mat4');
var vec3 = require('gl-vec3');
var vec2 = require('gl-vec2');

// Pre-allocated to prevent unecessary garbage collection
var m4scratch = mat4.create();
var m4scratch2 = mat4.create();
var v3scratch = [0, 0, 0];

vec3.unproject = function (dest, vec, z, view, proj, viewport) {
  if(!dest) {
    dest = [0, 0, 0];
  }

  dest[0] = 2.0 * (vec[0] - viewport[0]) / viewport[2] - 1.0;
  dest[1] = 2.0 * (vec[1] - viewport[1]) / viewport[3] - 1.0;
  dest[2] = 2.0 * z - 1.0;

  mat4.multiply(m4scratch, proj, view);
  vec3.transformMat4(dest, dest, mat4.invert(m4scratch, m4scratch));

  return dest;
};

vec3.abs = function (a) {
  var tmp = vec3.create();
  tmp[0] = Math.abs(a[0]);
  tmp[1] = Math.abs(a[1]);
  tmp[2] = Math.abs(a[2]);

  return tmp;
};

vec2.abs = function (a) {
  var tmp = vec2.create();
  tmp[0] = Math.abs(a[0]);
  tmp[1] = Math.abs(a[1]);

  return tmp;
};