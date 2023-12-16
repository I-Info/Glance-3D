const code = /* glsl */ `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
layout(location = 0) in vec4 a_position;
layout(location = 1) in vec3 a_normal;

uniform mat4 u_modelInverseTranspose;
uniform mat4 u_projection;

out vec3 v_normal;

// all shaders have a main function
void main() {
  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = u_projection * a_position;
  v_normal = mat3(u_modelInverseTranspose) * a_normal;
}
`;

export default code;
