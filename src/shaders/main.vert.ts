const code = /* glsl */ `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
layout(location = 0) in vec4 a_position;
layout(location = 1) in vec4 a_color;

uniform mat4 u_transform;

out vec4 v_color;

// all shaders have a main function
void main() {
  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = u_transform * a_position;
  v_color = a_color;
}
`;

export default code;
