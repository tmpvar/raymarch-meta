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

varying vec3 v_uv;
varying vec3 v_dir;
varying float v_aspect;
varying float v_fov;

#define EPS       0.001
#define PI 3.14159
#define OPS_SIZE /* OPS_SIZE */
#define OPS_RATIO 1.0//* OPS_SIZE */

#define RAYMARCH_CYCLES 32 /* RAYMARCH_DISABLED_CYCLES */
#define RAYMARCH_EPS 0.0001

float sample(int x, int y) {
  return texture2D(ops, vec2(x, y) * OPS_RATIO).x;
}

float solid_cone(vec3 p, vec2 c) { // c must be normalized
  float q = length(p.xy);
  return dot(c, vec2(q, p.z));
}

float solid_torus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
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

float solid_capped_cylinder(vec3 p, vec2 h) {
  vec2 d = abs(vec2(length(p.xz),p.y)) - h;
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

vec3 selectionColor = vec3(1.0, 0.3, 0.0);

vec3 perform_selection(in vec3 color, in float val) {
  return mix(color, selectionColor, val);
}

/* RAYMARCH_SETUP */

float raymarch(in vec3 origin, in vec3 direction, in float initial_dist) {
  float dist = 0.0;
  float h = 1.0;
  vec4 pos4;

  for(int i=0; i<RAYMARCH_CYCLES; i++) {

/* RAYMARCH_DISABLED_COLOR */

    vec3 position = origin+direction*dist;
    pos4 = vec4(position, 1.0);

/* RAYMARCH_OPS */

    // break if the size of the sphere is smaller than the radius of the cone
    float cone_radius = v_fov * dist;
    if (dist + initial_dist < cone_radius || h < RAYMARCH_EPS) {
      break;
    }


    dist += h;
  }

  return dist;
}


// TODO: support implementations/cards without OES_texture_float
void main() {
  float m = 1.0 / max(resolution.x, resolution.y);
  vec3 eye = clipToWorld[3].xyz / clipToWorld[3].w;

  float c  = texture2D(fbo, v_uv.xy).x;
  float ul = texture2D(fbo, v_uv.xy + vec2(-m,  m)).x;
  float t  = texture2D(fbo, v_uv.xy + vec2( 0.0,  m)).x;
  float ur = texture2D(fbo, v_uv.xy + vec2( m)).x;
  float r  = texture2D(fbo, v_uv.xy + vec2( m,  0.0)).x;
  float br = texture2D(fbo, v_uv.xy + vec2( m, -m)).x;
  float b  = texture2D(fbo, v_uv.xy + vec2( 0.0, -m)).x;
  float bl = texture2D(fbo, v_uv.xy + vec2(-m)).x;
  float l  = texture2D(fbo, v_uv.xy + vec2(-m,  0.0)).x;

  float last_distance = min(c, min(ul, min(t, min(ur, min(r, min(br, min(b, min(bl, l))))))));
  if (last_distance < 1000.0) {

    eye = eye + v_dir * last_distance;

    float surface_distance = 0.0;
    surface_distance = raymarch(eye, v_dir, last_distance);


    gl_FragColor = vec4(surface_distance, 0.0, 0.0, 1.0);
  } else {
    gl_FragColor = vec4(last_distance, 0.0, 0.0, 1.0);
  }
}
