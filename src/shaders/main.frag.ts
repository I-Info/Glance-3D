const code = /* glsl */ `#version 300 es

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

export default code;
