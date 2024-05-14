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

out vec3 v_normal;
out vec3 v_lightDir;
out vec3 v_vertPos;
out vec3 v_halfVector;

void main() {
  v_vertPos = (u_mv * a_position).xyz;
  v_lightDir = u_light.position - v_vertPos;
  v_normal = (u_norm * vec4(a_normal, 1.0)).xyz;
  v_halfVector = v_lightDir - v_vertPos;

  gl_Position = u_proj * u_mv * a_position; 
}
`;

const frag = /* glsl */ `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

in vec3 v_normal;
in vec3 v_lightDir;
in vec3 v_vertPos;
in vec3 v_halfVector;

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
  // 正规化光照向量、法向量、视觉向量
  vec3 L = normalize(v_lightDir); 
  vec3 N = normalize(v_normal); 
  vec3 V = normalize(-v_vertPos);
  vec3 H = normalize(v_halfVector);

  // 计算光照与平面法向量间的角度
  float cosTheta = dot(L,N); 
  // 计算法向量与角平分向量的角度
  float cosPhi = dot(H, N);

  // 计算ADS分量(按像素)，并合并以构建输出颜色
  vec3 ambient = ((u_globalAmbient * u_material.ambient) + (u_light.ambient * u_material.ambient)).xyz;
  vec3 diffuse = u_light.diffuse.xyz * u_material.diffuse.xyz * max(cosTheta,0.0);

  vec3 specular = 
     u_light.specular.xyz * u_material.specular.xyz * pow(max(cosPhi,0.0), u_material.shininess * 3.0); 

  outColor = vec4((ambient + diffuse + specular), 1.0);
}
`;

const defaults = {
  vert,
  frag,
};
export default defaults;
