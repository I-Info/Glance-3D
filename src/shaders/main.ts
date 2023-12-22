const vert = /* glsl */ `#version 300 es

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

const frag = /* glsl */ `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

in vec3 v_normal;

uniform vec3 u_lightDirection;
uniform vec4 u_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  vec3 normal = normalize(v_normal);

  float light = dot(normal, u_lightDirection);
  outColor = u_color;
  outColor.rgb *= light;
}
`;

const defaults = {
  vert,
  frag,
};
export default defaults;
