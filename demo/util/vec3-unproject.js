var mat4 = require('gl-mat4');
var vec3 = require('gl-vec3');


// Pre-allocated to prevent unecessary garbage collection
var m4scratch = mat4.create();
var m4scratch2 = mat4.create();
var v3scratch = [0, 0, 0];

vec3.unproject = function (dest, vec, view, proj, viewport) {
  if(!dest) {
    dest = [0, 0, 0];
  }

  v3scratch[0] = (vec[0] - viewport[0]) * 2.0 / viewport[2] - 1.0;
  v3scratch[1] = (vec[1] - viewport[1]) * 2.0 / viewport[3] - 1.0;
  v3scratch[2] = 2.0 * vec[2] - 1.0;

  mat4.multiply(m4scratch, view, mat4.invert(m4scratch2, proj));
  vec3.transformMat4(dest, v3scratch, m4scratch);

  return dest;
};
