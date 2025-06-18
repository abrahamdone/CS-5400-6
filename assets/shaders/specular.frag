#version 300 es

precision lowp float;

in vec4 vColor;
in vec2 vTexCoord;
in vec4 vNormal;
in vec4 vPosition;
uniform vec3 uEye;
uniform vec3 uSpecularLightPosition;
uniform vec3 uSpecularLight;
uniform float uSpecularN;
out vec4 vSpecularColor;

void main() {
    vec3 V = uEye - vPosition.xyz;
    vec3 R = 2.0 * dot(vNormal.xyz, uSpecularLightPosition) * vNormal.xyz - uSpecularLightPosition;
    float specularRed = clamp(uSpecularLight.x * vColor.x * clamp(pow(dot(V, R), uSpecularN), 0.0, 1.0), 0.0, 1.0);
    float specularGreen = clamp(uSpecularLight.y * vColor.y * clamp(pow(dot(V, R), uSpecularN), 0.0, 1.0), 0.0, 1.0);
    float specularBlue = clamp(uSpecularLight.z * vColor.z * clamp(pow(dot(V, R), uSpecularN), 0.0, 1.0), 0.0, 1.0);

    vSpecularColor = vec4(specularRed, specularGreen, specularBlue, vColor.w);
}