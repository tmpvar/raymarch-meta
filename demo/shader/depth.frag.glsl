#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D ops;
uniform sampler2D fbo;
uniform mat4 clipToWorld;
uniform vec2 resolution;
uniform float time;

uniform vec3 camera_eye;
uniform float camera_distance;

varying vec3 v_uv;
varying vec3 v_dir;

#define EPS       0.001
#define PI 3.14159
#define OPS_SIZE /* OPS_SIZE */
#define OPS_RATIO 1.0//* OPS_SIZE */

#define RAYMARCH_CYCLES /* RAYMARCH_CYCLES */
#define RAYMARCH_EPS 0.0001

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

// float unsigned_box_distance( vec3 p, vec3 b, float r ) {
//   return length(max(abs(p)-b,0.0))-r;
// }

vec3 selectionColor = vec3(1.0, 0.3, 0.0);

vec3 perform_selection(in vec3 color, in float val) {
  return mix(color, selectionColor, val);
}

/* RAYMARCH_SETUP */

float raymarch(in vec3 origin, in vec3 direction, out int steps, out float hit, out vec3 position, out vec3 color) {
  float dist = 0.0;
  float h = 1.0;
  hit = 10.0;
  float minStep = 0.00001;

  vec4 pos4;

  for(int i=0; i<RAYMARCH_CYCLES; i++) {

/* RAYMARCH_DISABLED_COLOR */




    steps = i;
    position = origin+direction*dist;
    pos4 = vec4(position, 1.0);

    //h = min(solid_capped_cylinder(position, vec2(0.23, 0.65)), solid_sphere(position, 0.25) );
    //h = solid_cone(position, normalize(vec2(0.25, 0.25)) );
    //h = solid_capped_cone(position, vec3(0.25, 0.25, 0.1) );
    //h = solid_torus(position, normalize(vec2(1.5, 0.15)) );
    //h = signed_box_distance(position, vec3(.1, .3, .25));

/* RAYMARCH_OPS */

    dist += h;
    hit = min(hit, h);

    if (h<RAYMARCH_EPS) {
      break;
    }

  }

  return dist;
}

void main() {
  vec3 eye = clipToWorld[3].xyz / clipToWorld[3].w;
  vec3 dir = normalize(v_dir);
  // gl_FragColor = vec4(dir, 1.0);
  // return;

  float surface_distance = 0.0;

  int steps = 0;
  float hit;
  vec3 surface_position;
  vec3 orange = vec3(1.0, 0.36, 0);

  surface_distance = raymarch(eye, dir, steps, hit, surface_position, orange);


  float sample = floor(hit + (1.0-RAYMARCH_EPS*500.0));

  // gl_FragColor = normalize(vec4(surface_distance, 0.0, 0.0, 1.0));

  gl_FragColor = mix(
    //vec4(normalize(vec4(surface_distance,surface_distance, surface_distance, 1.0))),
    vec4(dir, 1.0),
    vec4(1.0),
    // texture2D(fbo, v_uv.xy),
    sample
  );
}
