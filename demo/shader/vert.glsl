attribute vec3 position;
uniform mat4 worldToClip;
uniform mat4 uvmatrix;

varying vec3 v_uv;
varying vec3 v_dir;

#define PI 3.14159

float fov_y_scale  = tan((PI/4.0)/2.0);

uniform vec2 resolution;


void main() {
  v_uv = 0.5 * (position+1.0);

  gl_Position = vec4(position, 1.0);

  float aspect = resolution.x/resolution.y;

  v_dir = (vec4(
    position.x * fov_y_scale * aspect,
    position.y * fov_y_scale,
    -1.0,
    1.0
  ) * uvmatrix).xyz;
}
