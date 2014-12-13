var vec2 = require('gl-vec2');

vec2.abs = module.exports = function vec2abs(out, a) {
  out[0] = Math.abs(a[0]);
  out[1] = Math.abs(a[1]);
  return out;
};
