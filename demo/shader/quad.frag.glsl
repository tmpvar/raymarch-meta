// quad.frag.glsl

#ifdef GL_ES
precision highp float;
#endif

varying vec3 v_uv;
varying vec3 v_dir;
varying float v_aspect;
varying float v_fov;

/* FBO_STAGE_UNIFORMS */

void main() {

  // this shader has 2 purposes
  // * show the quad tree that is implicitly computed by
  //   the depthShader passes
  // * indicate whether the cell is filled or empty by changing the border
  //   color

  // TODO: change the color based on occupied status

  float edge = 0.0;

  /* FBO_STAGE_COMPUTE */

  gl_FragColor = vec4(1.0);
}
