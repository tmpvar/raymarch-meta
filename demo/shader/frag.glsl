#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D ops;
uniform mat4 clipToWorld;
uniform mat4 worldToClip;
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

// http://fhtr.blogspot.com/2013/12/opus-2-glsl-ray-tracing-tutorial.html
//float rayIntersectsSphere(vec3 ray, vec3 dir, vec3 center, float radius, float closestHit) {
bool rayIntersectsSphere(vec3 ray, vec3 dir, vec3 center, float radius) {
  vec3 rc = ray-center;
  float c = dot(rc, rc) - (radius*radius);
  float b = dot(dir, rc);
  float d = b*b - c;
  float t = -b - sqrt(abs(d));
  if (d < 0.0 || t < 0.0 /*  || t > closestHit */) {
    return false; // didn't hit
    // return closestHit; // Didn't hit, or wasn't the closest hit.
  } else {
    return true;
    // return t
  }
}



float raymarch(in vec3 origin, in vec3 direction, out int steps, out float hit, out vec3 position, out vec3 color) {
  float dist = 0.0;
  float h = 1.0;
  hit = 10.0;
  float minStep = 0.00001;




  vec4 pos4;


  for(int i=0; i<RAYMARCH_CYCLES; i++) {

/* RAYMARCH_COLOR */
/* RAYMARCH_SETUP */

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

vec3 gradientNormal(vec3 p) {
  vec3 dir = vec3(0.0, 0.0, 0.0);
  int steps;
  float hit;
  vec3 pos;
  vec3 scratchColor = vec3(0.0, 0.0, 0.0);
  return normalize(
    vec3(
      raymarch(p + vec3(EPS, 0, 0), dir, steps, hit, pos, scratchColor) -
      raymarch(p - vec3(EPS, 0, 0), dir, steps, hit, pos, scratchColor),

      raymarch(p + vec3(0, EPS, 0), dir, steps, hit, pos, scratchColor) -
      raymarch(p - vec3(0, EPS, 0), dir, steps, hit, pos, scratchColor),

      raymarch(p + vec3(0, 0, EPS), dir, steps, hit, pos, scratchColor) -
      raymarch(p - vec3(0, 0, EPS), dir, steps, hit, pos, scratchColor)
    )
  );
}

vec3 computeLight(in vec3 light_pos, in vec3 light_dir, in vec3 surface_position, in vec3 surface_normal, in float surface_distance) {
  int steps;
  float hit;
  vec3 lighthit;
  vec3 scratchColor = vec3(0.0, 0.0, 0.0);
  float light = raymarch(
    light_pos,
    light_dir,
    steps,
    hit,
    lighthit,
    scratchColor
  );

  return vec3(1.0, 0.8, 0.6) * max(
    0.0,
    dot(normalize(light_pos - surface_position), surface_normal)// / (surface_distance)
  );
}

void main() {
  vec3 eye = clipToWorld[3].xyz / clipToWorld[3].w;
  vec3 dir = normalize(v_dir);


vec3 asdf[4];
asdf[0] = vec3(0.0, 0.0, 0.0);
asdf[1] = vec3(0.0, 0.5, 0.0);
asdf[2] = vec3(0.0, 2.5, 0.0);
asdf[3] = vec3(0.9, 0.5, 0.4);

float radii[4];
radii[0] = 0.5;
radii[1] = 0.23;
radii[2] = 1.6;
radii[3] = 0.4;

#define SHAPE_COUNT 4

bool found = false;
for (int x = 0; x < SHAPE_COUNT; x++) {
  if (rayIntersectsSphere(eye, dir, asdf[x], radii[x])) {
    found = true;
    break; // stop looking - our ray has hit a bounding sphere
  }
}

if (!found) return;


  float surface_distance = 0.0;

  int steps = 0;
  float hit;
  vec3 surface_position;
  vec3 orange = vec3(1.0, 0.36, 0);

  surface_distance = raymarch(eye, dir, steps, hit, surface_position, orange);
  vec3 surface_normal = gradientNormal(surface_position);

  vec3 diffuse = computeLight(
    vec3(0.0, 2.0, 1.0),    // light position
    vec3(0.0, -1.0, 0.0),   // light direction
    surface_position,
    surface_normal,
    surface_distance
  );

  vec3 diffuse2 = computeLight(
    eye,    // light position
    dir,   // light direction
    surface_position,
    surface_normal,
    surface_distance
  );

  gl_FragColor = mix(
    vec4(abs(dir), 1.0),
    vec4(
      orange * max(diffuse2, diffuse * 0.5),
      1.0
    ),
    1.0-floor(clamp(hit * 1000.0, 0.0, 1.0))
  );
}
