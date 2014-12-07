#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D ops;
uniform mat4 clipToWorld;
uniform vec2 resolution;
uniform float time;



varying vec3 v_uv;

#define PI 3.14159
#define OPS_SIZE /* OPS_SIZE */
#define OPS_RATIO 1.0//* OPS_SIZE */

#define RAYMARCH_CYCLES /* RAYMARCH_CYCLES */

// void circle(vec2 pos, float r, inout float dist) {
//   vec2 p = v_uv + pos;
//   dist = min(dist, length(p)-r);
// }

float sample(int x, int y) {
  return texture2D(ops, vec2(x, y) * OPS_RATIO).x;
}

float signed_box_distance(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) +
         length(max(d,0.0));
}

float solid_sphere(vec3 p, float r) {
  return length(p) - r;
}

// float unsigned_box_distance( vec3 p, vec3 b, float r ) {
//   return length(max(abs(p)-b,0.0))-r;
// }

float raymarch(in vec3 origin, in vec3 direction, out int steps, out bool hit) {
  float dist = 0.0;
  float h = 1.0;

  for(int i=0; i<RAYMARCH_CYCLES; i++) {
    if (h<=0.0) {
      continue;
    }
    steps = i;

    vec3 position = origin+direction*dist;
    h = signed_box_distance(position, vec3(.1, .5, .25));
    h = min(h, solid_sphere(position, 0.25));

    /* RAYMARCH_OPS */

    if (h < 0.001) {
      hit = true;
    }
    dist += h;
  }

  return dist;
}

void main() {
  // vec2 uv = (v_uv * 2.0) - 1.0;
  vec3 eye = clipToWorld[3].xyz / clipToWorld[3].w;
  vec3 dir = normalize(v_uv - eye);

  float dist = 0.0;

  int steps = 0;
  bool hit = false;
  dist = raymarch(eye, dir, steps, hit);
  dist = min(dist, raymarch(normalize(v_uv - vec3(0.01, 0.0, 0.0) - eye), dir, steps, hit));

//float(steps)/float(RAYMARCH_CYCLES)
  gl_FragColor = vec4(1.0-dist, 1.0-dist, 1.0-dist, 1.0);

  // if (dist > 1.0) {
  //   gl_FragColor = vec4(0.0, 0.0, 0.5, 0.1);
  // } else {
  //   gl_FragColor = vec4(dist, steps, 1.0, dist);
  // }

}
