// quad.frag.glsl

#ifdef GL_ES
precision highp float;
#endif

varying vec3 v_uv;
varying vec3 v_dir;
varying float v_aspect;
varying float v_fov;

uniform sampler2D ops;
uniform sampler2D fbo;

/* FBO_STAGE_UNIFORMS */

uniform vec2 resolution;

void main() {
  // this shader has 2 purposes
  // * show the quad tree that is implicitly computed by
  //   the depthShader passes
  // * indicate whether the cell is filled or empty by changing the border
  //   color

  // TODO: change the color based on occupied status

  float edge;

  /* FBO_STAGE_COMPUTE */

  if (edge < 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  } else {
    gl_FragColor = texture2D(fbo, v_uv.xy);
  }
}
