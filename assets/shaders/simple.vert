#version 300 es

in vec4 aPosition;
in vec4 aNormal;
in vec2 aTexCoord;
uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
uniform vec4 uMaterial;
out vec4 vColor;
out vec2 vTexCoord;
out vec4 vNormal;
out vec4 vPosition;

void main() {
    mat4 transform = uView * uModel;
    vec4 position = transform * aPosition;

    vNormal = transpose(inverse(transform)) * aNormal;
    vColor = uMaterial;
    vTexCoord = aTexCoord;
    gl_Position = uProjection * position;
}