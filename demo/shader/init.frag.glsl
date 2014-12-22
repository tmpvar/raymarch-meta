#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D ops;
uniform sampler2D fbo;
uniform mat4 clipToWorld;
uniform mat4 worldToClip;
uniform vec2 resolution;
uniform float time;

uniform vec3 camera_eye;
uniform float camera_distance;

varying vec3 v_uv;


void main() {
  gl_FragColor = vec4(1.0);
}
