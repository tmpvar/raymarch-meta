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

float solid_cone(vec3 p, vec2 c) { // c must be normalized
  float q = length(p.xy);
  return dot(c, vec2(q, p.z));
}

float solid_capped_cone(in vec3 p, in vec3 c) {
  vec2 q = vec2( length(p.xz), p.y );
  vec2 v = vec2( c.z*c.y/c.x, -c.z );

  vec2 w = v - q;

  vec2 vv = vec2( dot(v,v), v.x*v.x );
  vec2 qv = vec2( dot(v,w), v.x*w.x );

  vec2 d = max(qv,0.0)*qv/vv;

  return sqrt( dot(w,w) - max(d.x,d.y) )* sign(max(q.y*v.x-q.x*v.y,w.y));
}

vec3 selectionColor = vec3(1.0, 0.3, 0.0);

vec3 perform_selection(in vec3 color, in float val) {
  return mix(color, selectionColor, val);
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
    if (h/2.0 < cone_radius || h < RAYMARCH_EPS) {
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
  float m = 1.0 / max(resolution.x, resolution.y);

  vec4 last_sample  = texture2D(fbo, v_uv.xy);
  // float ul = texture2D(fbo, v_uv.xy + vec2(-m,  m)).x;
  // float t  = texture2D(fbo, v_uv.xy + vec2( 0.0,  m)).x;
  // float ur = texture2D(fbo, v_uv.xy + vec2( m)).x;
  // float r  = texture2D(fbo, v_uv.xy + vec2( m,  0.0)).x;
  // float br = texture2D(fbo, v_uv.xy + vec2( m, -m)).x;
  // float b  = texture2D(fbo, v_uv.xy + vec2( 0.0, -m)).x;
  // float bl = texture2D(fbo, v_uv.xy + vec2(-m)).x;
  // float l  = texture2D(fbo, v_uv.xy + vec2(-m,  0.0)).x;

  // float last_distance = min(c, min(ul, min(t, min(ur, min(r, min(br, min(b, min(bl, l))))))));

  if (last_sample.y == 1.0) {

    gl_FragColor = raymarch(
      clipToWorld[3].xyz / clipToWorld[3].w,
      v_dir,
      last_sample.x
    );
  } else {
    gl_FragColor = last_sample;
  }

  // gl_FragColor = mix(
  //   last_sample,
  //   current_sample,
  //   current_sample.y
  // );

  // if (last_sample.y == 1.0) {


  //   gl_FragColor = r


  //   // gl_FragColor = vec4(surface_distance, hit, 0.0, 1.0);
  // } else {
  //   gl_FragColor = last_sample;//vec4(last_sample.x, 0.0, 0.0, 1.0);
  // }
}
