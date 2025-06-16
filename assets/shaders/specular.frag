#version 300 es

precision lowp float;

in vec4 vColor;
in vec4 vNormal;
in vec4 vPosition;
uniform vec3 uSpecularLightPosition;
uniform vec3 uSpecularLight;
out vec4 outSpecularColor;

void main() {
    outSpecularColor = vColor;
}