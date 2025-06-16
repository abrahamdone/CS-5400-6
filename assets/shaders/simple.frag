#version 300 es

precision lowp float;

in vec4 vColor;
in vec2 vTexCoord;
uniform sampler2D uSampler;
out vec4 outColor;

void main() {
    vec4 color = texture(uSampler, vTexCoord);
    float x = clamp(color.x + vColor.x, 0.0, 1.0);
    float y = clamp(color.y + vColor.y, 0.0, 1.0);
    float z = clamp(color.z + vColor.z, 0.0, 1.0);
    float w = clamp(color.w + vColor.w, 0.0, 1.0);
//    outColor = vec4(x, y, z, w);
    outColor = color;
}