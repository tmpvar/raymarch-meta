// debug.frag.glsl

#ifdef GL_ES
precision highp float;
#endif

uniform vec2 resolution;
uniform sampler2D fbo;
varying vec3 v_uv;

void main() {
  gl_FragColor = texture2D(fbo, v_uv.xy);
  //gl_FragColor = vec4(texture2D(fbo, v_uv.xy).x/10.0, 0.0, 0.0, 1.0);
}
