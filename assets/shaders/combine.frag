#version 300 es

precision lowp float;

in vec4 vColor;
in vec2 vTexCoord;
in vec4 vNormal;
in vec4 vPosition;
uniform vec3 uDiffuseLightPosition;
uniform vec3 uDiffuseLight;
uniform vec3 uEye;
uniform vec3 uSpecularLightPosition;
uniform vec3 uSpecularLight;
uniform float uSpecularN;
uniform sampler2D uSampler;
out vec4 outColor;

void main() {
    vec4 color = texture(uSampler, vTexCoord);

    float diffuseRed = clamp(color.x * uDiffuseLight.x * dot(vNormal.xyz, normalize(uDiffuseLightPosition - vPosition.xyz)), 0.0, 1.0);
    float diffuseGreen = clamp(color.y * uDiffuseLight.y * dot(vNormal.xyz, normalize(uDiffuseLightPosition - vPosition.xyz)), 0.0, 1.0);
    float diffuseBlue = clamp(color.z * uDiffuseLight.z * dot(vNormal.xyz, normalize(uDiffuseLightPosition - vPosition.xyz)), 0.0, 1.0);

    vec3 V = uEye - vPosition.xyz;
    vec3 R = 2.0 * dot(vNormal.xyz, uSpecularLightPosition) * vNormal.xyz - uSpecularLightPosition;
    float specularRed = clamp(uSpecularLight.x * color.x * clamp(pow(dot(V, R), uSpecularN), 0.0, 1.0), 0.0, 1.0);
    float specularGreen = clamp(uSpecularLight.y * color.y * clamp(pow(dot(V, R), uSpecularN), 0.0, 1.0), 0.0, 1.0);
    float specularBlue = clamp(uSpecularLight.z * color.z * clamp(pow(dot(V, R), uSpecularN), 0.0, 1.0), 0.0, 1.0);

    outColor = vec4(clamp(diffuseRed + specularRed, 0.0, 1.0), clamp(diffuseGreen + specularGreen, 0.0, 1.0), clamp(diffuseBlue + specularBlue, 0.0, 1.0), color.w);
}