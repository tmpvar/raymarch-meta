#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D ops;
uniform mat4 clipToWorld;
uniform vec2 resolution;
uniform float time;


varying vec3 v_uv;

#define EPS       0.001
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

float dot2( in vec3 v ) { return dot(v,v); }
float solid_triangle( vec3 p, vec3 a, vec3 b, vec3 c )
{
    vec3 ba = b - a; vec3 pa = p - a;
    vec3 cb = c - b; vec3 pb = p - b;
    vec3 ac = a - c; vec3 pc = p - c;
    vec3 nor = cross( ba, ac );

    return sqrt(
    (sign(dot(cross(ba,nor),pa)) +
     sign(dot(cross(cb,nor),pb)) +
     sign(dot(cross(ac,nor),pc))<2.0)
     ?
     min( min(
     dot2(ba*clamp(dot(ba,pa)/dot2(ba),0.0,1.0)-pa),
     dot2(cb*clamp(dot(cb,pb)/dot2(cb),0.0,1.0)-pb) ),
     dot2(ac*clamp(dot(ac,pc)/dot2(ac),0.0,1.0)-pc) )
     :
     dot(nor,pa)*dot(nor,pa)/dot2(nor) );
}

// float unsigned_box_distance( vec3 p, vec3 b, float r ) {
//   return length(max(abs(p)-b,0.0))-r;
// }

float raymarch(in vec3 origin, in vec3 direction, out int steps, out float hit, out vec3 position) {
  float dist = 0.0;
  float h = 1.0;
  hit = 10.0;
  float minStep = 0.00001;

/* RAYMARCH_SETUP */

  for(int i=0; i<RAYMARCH_CYCLES; i++) {

    steps = i;
    position = origin+direction*dist;

    //h = min(solid_capped_cylinder(position, vec2(0.23, 0.65)), solid_sphere(position, 0.25) );
    //h = solid_cone(position, normalize(vec2(0.25, 0.25)) );
    //h = solid_capped_cone(position, vec3(0.25, 0.25, 0.1) );
    //h = solid_torus(position, normalize(vec2(1.5, 0.15)) );
    //h = signed_box_distance(position, vec3(.1, .3, .25));

/* RAYMARCH_OPS */

    dist += h;
    hit = min(hit, h);
  }

  return dist;
}

vec3 gradientNormal(vec3 p) {
  vec3 dir = vec3(0.0, 0.0, 0.0);
  int steps;
  float hit;
  vec3 pos;
  return normalize(
    vec3(
      raymarch(p + vec3(EPS, 0, 0), dir, steps, hit, pos) -
      raymarch(p - vec3(EPS, 0, 0), dir, steps, hit, pos),

      raymarch(p + vec3(0, EPS, 0), dir, steps, hit, pos) -
      raymarch(p - vec3(0, EPS, 0), dir, steps, hit, pos),

      raymarch(p + vec3(0, 0, EPS), dir, steps, hit, pos) -
      raymarch(p - vec3(0, 0, EPS), dir, steps, hit, pos)
    )
  );
}

vec3 computeLight(in vec3 light_pos, in vec3 light_dir, in vec3 surface_position, in vec3 surface_normal, in float surface_distance) {
  int steps;
  float hit;
  vec3 lighthit;
  float light = raymarch(
    light_pos,
    light_dir,
    steps,
    hit,
    lighthit
  );

  return vec3(1.0, 0.8, 0.6) * max(
    0.0,
    dot(normalize(light_pos - surface_position), surface_normal)// / (surface_distance)
  );
}

void main() {
  vec3 eye = clipToWorld[3].xyz / clipToWorld[3].w;
  vec3 dir = normalize(v_uv - eye);

  float surface_distance = 0.0;

  int steps = 0;
  float hit;
  vec3 surface_position;
  surface_distance = raymarch(eye, dir, steps, hit, surface_position);

  vec3 orange = vec3(1.0, 0.36, 0);
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
    vec4(1.0),
    vec4(
      orange * max(diffuse2, diffuse * 0.5),
      1.0
    ),
    1.0-floor(clamp(hit * 1000.0, 0.0, 1.0))
  );
}
