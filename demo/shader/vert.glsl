attribute vec3 position;
varying vec3 v_uv;

void main() {
   v_uv = position;
   gl_Position = vec4(position, 1.0);
}