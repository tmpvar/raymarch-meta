// depth.frag.glsl

#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D ops;
uniform sampler2D fbo;
uniform vec2 fbo_resolution;
uniform mat4 clipToWorld;
uniform vec2 resolution;
uniform float time;

uniform vec3 camera_eye;
uniform float camera_distance;

/* RAYMARCH_UNIFORM_INVERTED_SHAPE_MATRICES */

varying vec3 v_uv;
varying vec3 v_dir;
varying float v_aspect;
varying float v_fov;

#define EPS       0.001
#define PI 3.14159
#define OPS_SIZE /* OPS_SIZE */
#define OPS_RATIO 1.0//* OPS_SIZE */

#define RAYMARCH_CYCLES 128 /* RAYMARCH_DISABLED_CYCLES */
#define RAYMARCH_EPS 0.0001

float sample(int x, int y) {
  return texture2D(ops, vec2(x, y) * OPS_RATIO).x;
}

vec4 raymarch(in vec3 origin, in vec3 direction, in float dist) {
  float h = 1.0;
  float hit = 0.0;
  vec4 pos4;
  float m = (resolution.x/resolution.y);

/* RAYMARCH_SETUP */

  for(int i=0; i<RAYMARCH_CYCLES; i++) {

    vec3 position = origin+direction*dist;
    pos4 = vec4(position, 1.0);

/* RAYMARCH_OPS */

    // break if the size of the sphere is smaller than the radius of the cone
    float latest_distance = h;// + dist;
    float cone_radius = v_fov * latest_distance;
    if (h < cone_radius || h/5000.0 < RAYMARCH_EPS) {
      hit = 1.0;
      dist -= h;
      break;
    }

    dist += h;
  }

  return vec4(dist, hit, 1.0, 0.0);
}


// TODO: support implementations/cards without OES_texture_float
void main() {
  vec4 last_sample  = texture2D(fbo, v_uv.xy);
  if (last_sample.y == 1.0) {

    gl_FragColor = raymarch(
      clipToWorld[3].xyz / clipToWorld[3].w,
      v_dir,
      last_sample.x
    );
  } else {
    gl_FragColor = last_sample;
  }
}
