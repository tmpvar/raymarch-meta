#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D ops;

varying vec2 v_uv;

#define OPS_SIZE /* OPS_SIZE */
#define OPS_RATIO 1.0//* OPS_SIZE */

#define RAYMARCH_CYCLES /* RAYMARCH_CYCLES */

void circle(vec2 pos, float r, inout float dist) {
  vec2 p = v_uv + pos;
  dist = min(dist, length(p)-r);
}

float sample(int x, int y) {
  return texture2D(ops, vec2(x, y) * OPS_RATIO).x;
}

void main() {
  float dist = 0.0;

/* ops */

  if (dist < 0.0) {
    gl_FragColor = vec4(1.0);
  } else {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }

  // float t = smoothstep(0.25, 0.0, dist);
  // gl_FragColor = mix(vec4(1.0, 0.0, 0.0, 1.0), vec4(1.0), t);

   // gl_FragColor = min(
   //  vec4(length(v_uv), 0.0, 0.0, 1.0),
   //  vec4(normalize(v_uv + 1.0), 0.0, 1.0));
}
