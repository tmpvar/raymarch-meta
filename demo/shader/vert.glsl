attribute vec3 position;
uniform mat4 worldToClip;

varying vec3 v_uv;

void main() {
   v_uv = position;
   //gl_Position = worldToClip * vec4(position, 1.0);
   gl_Position = vec4(position, 1.0);
}