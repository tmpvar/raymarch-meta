#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D ops;
uniform vec3 camera_eye;
uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;


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

float signed_box_distance(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) +
         length(max(d,0.0));
}

// float unsigned_box_distance( vec3 p, vec3 b, float r ) {
//   return length(max(abs(p)-b,0.0))-r;
// }

float raymarch(in vec3 origin, in vec3 direction, out int steps) {
  float t = 0.0;
  float h = 1.0;

  for(int i=0; i<RAYMARCH_CYCLES; i++) {
    // if (h<=0.0) {
    //   continue;
    // }
    steps = i;

    vec3 position = origin+direction*t;
    h = signed_box_distance(position, vec3(0.2, 0.2, 0.5));
    t += h;
  }

  return t;
}

void main() {
  vec2 uv = v_uv;
  float dist = 0.0;

  vec3 eye = vec3(uv, 5.0) - camera_eye;
  vec3 dir = -eye + vec3(uv, 1.0);
  int steps = 0;
  dist = raymarch(
    eye,
    normalize(dir),
    steps
  );

/* ops */

  if (dist > 0.5) {
    gl_FragColor = vec4(0.0, 0.0, 0.5, 0.1);
  } else {

    gl_FragColor = vec4(0.0, steps/RAYMARCH_CYCLES, 0.0, 1.0 -dist);
  }
  // normalize((normalize(vec4(dist)) + 1.0) / 2.0);
  // if (dist < 0.0) {
  //   gl_FragColor = vec4(dist);
  // } else {
  //   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  // }

  // float t = smoothstep(0.25, 0.0, dist);
  // gl_FragColor = mix(vec4(1.0, 0.0, 0.0, 1.0), vec4(1.0), t);

   // gl_FragColor = min(
   //  vec4(length(v_uv), 0.0, 0.0, 1.0),
   //  vec4(normalize(v_uv + 1.0), 0.0, 1.0));
}
