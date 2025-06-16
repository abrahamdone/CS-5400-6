#version 300 es

precision lowp float;

in vec4 vColor;
in vec2 vTexCoord;
in vec4 vNormal;
in vec4 vPosition;
uniform vec3 uDiffuseLightPosition;
uniform vec3 uDiffuseLight;
uniform sampler2D uSampler;
out vec4 outDiffuseColor;

void main() {
    vec4 color = texture(uSampler, vTexCoord);
    float diffuseRed = clamp(color.x * uDiffuseLight.x * dot(vNormal.xyz, normalize(uDiffuseLightPosition - vPosition.xyz)), 0.0, 1.0);
    float diffuseGreen = clamp(color.y * uDiffuseLight.y * dot(vNormal.xyz, normalize(uDiffuseLightPosition - vPosition.xyz)), 0.0, 1.0);
    float diffuseBlue = clamp(color.z * uDiffuseLight.z * dot(vNormal.xyz, normalize(uDiffuseLightPosition - vPosition.xyz)), 0.0, 1.0);

    outDiffuseColor = vec4(diffuseRed, diffuseGreen, diffuseBlue, color.w);
}