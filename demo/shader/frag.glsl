#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D fbo;
uniform sampler2D ops;
uniform mat4 clipToWorld;
uniform vec2 resolution;
uniform float time;

/* RAYMARCH_UNIFORM_INVERTED_SHAPE_MATRICES */

uniform vec3 camera_eye;
uniform float camera_distance;

varying vec3 v_uv;
varying vec3 v_dir;

#define EPS       0.001
#define PI 3.14159
#define OPS_SIZE /* OPS_SIZE */
#define OPS_RATIO 1.0//* OPS_SIZE */

#define RAYMARCH_CYCLES /* RAYMARCH_CYCLES */
#define RAYMARCH_QUICK_CYCLES 16
#define RAYMARCH_EPS /* RAYMARCH_EPS */

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

float raymarch(in vec3 origin, in vec3 direction, out int steps, out float hit, out vec3 position, out vec3 color) {
  float dist = 0.0;
  float h = 1.0;
  hit = 10.0;
  vec4 pos4;

/* RAYMARCH_COLOR */
/* RAYMARCH_SETUP */

  for(int i=0; i<RAYMARCH_CYCLES; i++) {

    steps = i;
    position = origin+direction*dist;
    pos4 = vec4(position, 1.0);

/* RAYMARCH_OPS */
/* RAYMARCH_OPS_COLOR */

    dist += h;
    hit = min(hit, h);

    if (h<RAYMARCH_EPS) {
      break;
    }
  }

  return dist;
}

float raymarch_quick(in vec3 origin, in vec3 direction) {
  float dist = 0.0;
  float h = 1.0;
  vec3 position;
  vec4 pos4;

/* RAYMARCH_SETUP */

  for(int i=0; i<RAYMARCH_QUICK_CYCLES; i++) {
    position = origin+direction*dist;
    pos4 = vec4(position, 1.0);

/* RAYMARCH_OPS */

    dist += h;

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
      raymarch_quick(p + vec3(EPS, 0, 0), dir) -
      raymarch_quick(p - vec3(EPS, 0, 0), dir),

      raymarch_quick(p + vec3(0, EPS, 0), dir) -
      raymarch_quick(p - vec3(0, EPS, 0), dir),

      raymarch_quick(p + vec3(0, 0, EPS), dir) -
      raymarch_quick(p - vec3(0, 0, EPS), dir)
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
  vec3 dir = normalize(v_dir);
  vec4 last_sample = texture2D(fbo, v_uv.xy);


  if (last_sample.y == 1.0) {
    vec3 eye = clipToWorld[3].xyz / clipToWorld[3].w;
    eye = eye + v_dir * last_sample.x;

    float surface_distance = 0.0;

    int steps = 0;
    float hit;
    vec3 surface_position;
    vec3 pixelColor = vec3(1.0, 0.36, 0);

    surface_distance = raymarch(eye, dir, steps, hit, surface_position, pixelColor);
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

 float sample = floor(hit + (1.0-RAYMARCH_EPS*1000.0));

    gl_FragColor = mix(
      vec4(abs(dir), 1.0),
      vec4(
        pixelColor * max(diffuse2, diffuse * 0.5),
        1.0
      ),
      1.0-sample
    );

    // gl_FragColor = mix(
    //   vec4(abs(dir), 1.0),
    //   vec4(
    //     pixelColor * max(diffuse2, diffuse * 0.5),
    //     1.0
    //   ),
    //   1.0-floor(clamp(hit * 1000.0, 0.0, 1.0))
    // );
  } else {
    gl_FragColor =  vec4(abs(dir), 1.0);
  }
}
