const vert = /* glsl */ `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
layout(location = 0) in vec4 a_position;
layout(location = 1) in vec3 a_normal;

struct PositionalLight {
    vec4 ambient; 
    vec4 diffuse; 
    vec4 specular; 
    vec3 position;
};
struct Material {
    vec4 ambient; 
    vec4 diffuse; 
    vec4 specular; 
    float shininess;
};

uniform vec4 u_globalAmbient;
uniform PositionalLight u_light;
uniform Material u_material;

uniform mat4 u_mv;
uniform mat4 u_proj;
uniform mat4 u_norm;

out vec4 v_color;

void main() {
    // Transform the vertex position to view space
    vec4 P = u_mv * a_position; 

    // Transform the normal to view space
    vec3 N = normalize((u_norm * vec4(a_normal, 1.0)).xyz);

    // Calculate the view space light vector (from vertex to light)
    vec3 L = normalize(u_light.position - P.xyz);

    // View vector is the negative of the view space vertex position
    vec3 V = normalize(-P.xyz);

    // R is the reflection of -L about the surface normal N
    vec3 R = reflect(-L, N);

    // Calculate ambient, diffuse, and specular components
    vec3 ambient = (u_globalAmbient * u_material.ambient + u_light.ambient * u_material.ambient).xyz;
    vec3 diffuse = u_light.diffuse.xyz * u_material.diffuse.xyz * max(dot(N, L), 0.0);
    vec3 specular = u_material.specular.xyz * u_light.specular.xyz * pow(max(dot(R, V), 0.0), u_material.shininess);

    // Send the color output to the fragment shader
    v_color = vec4(ambient + diffuse + specular, 1.0);

    // Send the position to the fragment shader as well
    gl_Position = u_proj * P;
}
`;

const frag = /* glsl */ `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

in vec4 v_color;

struct PositionalLight
{ vec4 ambient; 
  vec4 diffuse; 
  vec4 specular; 
  vec3 position;
};
struct Material
{ vec4 ambient; 
  vec4 diffuse; 
  vec4 specular; 
  float shininess;
};

uniform vec4 u_globalAmbient;
uniform PositionalLight u_light;
uniform Material u_material;

uniform mat4 u_mv;
uniform mat4 u_proj;
uniform mat4 u_norm;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = v_color;
}
`;

const defaults = {
  vert,
  frag,
};
export default defaults;
