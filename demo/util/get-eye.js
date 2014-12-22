var mat4 = require('gl-mat4');

module.exports = getEye;

var m4scratch = mat4.create();
function getEye(out, view) {
  mat4.invert(m4scratch, view);
  out[0] = m4scratch[12];
  out[1] = m4scratch[13];
  out[2] = m4scratch[14]
  return out;
}
