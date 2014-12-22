#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D fbo;

void main() {
  gl_FragColor = texture2D(fbo, 0.5 * (gl_FragCoord.xy + 1.0));
}
