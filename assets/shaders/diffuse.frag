#version 300 es

precision lowp float;

in vec4 vColor;
in vec2 vTexCoord;
in vec4 vNormal;
in vec4 vPosition;
uniform vec3 uDiffuseLightPosition;
uniform vec3 uDiffuseLight;
uniform sampler2D uSampler;
out vec4 vDiffuseColor;

void main() {
    float diffuseRed = clamp(vColor.x * uDiffuseLight.x * dot(vNormal.xyz, normalize(uDiffuseLightPosition - vPosition.xyz)), 0.0, 1.0);
    float diffuseGreen = clamp(vColor.y * uDiffuseLight.y * dot(vNormal.xyz, normalize(uDiffuseLightPosition - vPosition.xyz)), 0.0, 1.0);
    float diffuseBlue = clamp(vColor.z * uDiffuseLight.z * dot(vNormal.xyz, normalize(uDiffuseLightPosition - vPosition.xyz)), 0.0, 1.0);

    vDiffuseColor = vec4(diffuseRed, diffuseGreen, diffuseBlue, vColor.w);
}