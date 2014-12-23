#ifdef GL_ES
precision highp float;
#endif

varying vec3 v_uv;
uniform vec2 resolution;

void main() {
  gl_FragColor = vec4(normalize(v_uv.xy), 0.0, 1.0);
}
