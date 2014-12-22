uniform sampler2D fbo;
uniform vec2 fbo_resolution;

void main() {
  gl_FragColor = texture2D(fbo, gl_FragCoord.xy);
}
