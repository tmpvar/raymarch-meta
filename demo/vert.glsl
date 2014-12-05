attribute vec4 position;
uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

varying vec2 v_uv;

void main() {
   v_uv = position.xy;

   gl_Position = projection * view * model * position;
   gl_PointSize = 1.0;
}
