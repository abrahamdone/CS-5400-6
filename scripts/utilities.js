

//------------------------------------------------------------------
//
// Helper function used to load a file from the server
//
//------------------------------------------------------------------
async function loadFileFromServer(filename) {
    let result = await fetch(filename);
    return result.text();
}

async function loadTextureFromServer(filename) {
    try {
        let asset = new Image();
        asset.src = filename;
        await asset.decode();
        console.log('loaded the texture');
        return asset;
    } catch (err) {
        console.log('bad things happened when loading the texture');
        throw err;
    }
}

//------------------------------------------------------------------
//
// Helper function to multiply two 4x4 matrices.
//
//------------------------------------------------------------------
function multiplyMatrix4x4(m1, m2) {
    let r = [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
    ];

    // Iterative multiplication
    // for (let i = 0; i < 4; i++) {
    //     for (let j = 0; j < 4; j++) {
    //         for (let k = 0; k < 4; k++) {
    //             r[i * 4 + j] += m1[i * 4 + k] * m2[k * 4 + j];
    //         }
    //     }
    // }

    // "Optimized" manual multiplication
    r[0] = m1[0] * m2[0] + m1[1] * m2[4] + m1[2] * m2[8] + m1[3] * m2[12];
    r[1] = m1[0] * m2[1] + m1[1] * m2[5] + m1[2] * m2[9] + m1[3] * m2[13];
    r[2] = m1[0] * m2[2] + m1[1] * m2[6] + m1[2] * m2[10] + m1[3] * m2[14];
    r[3] = m1[0] * m2[3] + m1[1] * m2[7] + m1[2] * m2[11] + m1[3] * m2[15];

    r[4] = m1[4] * m2[0] + m1[5] * m2[4] + m1[6] * m2[8] + m1[7] * m2[12];
    r[5] = m1[4] * m2[1] + m1[5] * m2[5] + m1[6] * m2[9] + m1[7] * m2[13];
    r[6] = m1[4] * m2[2] + m1[5] * m2[6] + m1[6] * m2[10] + m1[7] * m2[14];
    r[7] = m1[4] * m2[3] + m1[5] * m2[7] + m1[6] * m2[11] + m1[7] * m2[15];

    r[8] = m1[8] * m2[0] + m1[9] * m2[4] + m1[10] * m2[8] + m1[11] * m2[12];
    r[9] = m1[8] * m2[1] + m1[9] * m2[5] + m1[10] * m2[9] + m1[11] * m2[13];
    r[10] = m1[8] * m2[2] + m1[9] * m2[6] + m1[10] * m2[10] + m1[11] * m2[14];
    r[11] = m1[8] * m2[3] + m1[9] * m2[7] + m1[10] * m2[11] + m1[11] * m2[15];

    r[12] = m1[12] * m2[0] + m1[13] * m2[4] + m1[14] * m2[8] + m1[15] * m2[12];
    r[13] = m1[12] * m2[1] + m1[13] * m2[5] + m1[14] * m2[9] + m1[15] * m2[13];
    r[14] = m1[12] * m2[2] + m1[13] * m2[6] + m1[14] * m2[10] + m1[15] * m2[14];
    r[15] = m1[12] * m2[3] + m1[13] * m2[7] + m1[14] * m2[11] + m1[15] * m2[15];

    return r;
}

//------------------------------------------------------------------
//
// Transpose a matrix.
// Reference: https://jsperf.com/transpose-2d-array
//
//------------------------------------------------------------------
function transposeMatrix4x4(m) {
    let t = [
        m[0], m[4], m[8], m[12],
        m[1], m[5], m[9], m[13],
        m[2], m[6], m[10], m[14],
        m[3], m[7], m[11], m[15]
    ];
    return t;
}

function identityMatrix() {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]
}

function moveMatrix(x, y, z) {
    return [
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1
    ]
}

function rotateXYMatrix(center, angle) {
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);
    return multiplyMatrix4x4(moveMatrix(-center.x, -center.y, -center.z), multiplyMatrix4x4([
        cos, -sin,    0,    0,
        sin,  cos,    0,    0,
          0,    0,    1,    0,
          0,    0,    0,    1,
    ], moveMatrix(center.x, center.y, center.z)));
}

function rotateXZMatrix(center, angle) {
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);
    return multiplyMatrix4x4(moveMatrix(-center.x, -center.y, -center.z), multiplyMatrix4x4([
         cos,    0,  sin,    0,
           0,    1,    0,    0,
        -sin,    0,  cos,    0,
           0,    0,    0,    1
    ], moveMatrix(center.x, center.y, center.z)));
}

function rotateYZMatrix(center, angle) {
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);
    return multiplyMatrix4x4(moveMatrix(-center.x, -center.y, -center.z), multiplyMatrix4x4([
        1,    0,    0,    0,
        0,  cos, -sin,    0,
        0,  sin,  cos,    0,
        0,    0,    0,    1
    ], moveMatrix(center.x, center.y, center.z)));
}

function scaleMatrix(center, sizeX, sizeY, sizeZ) {
    return multiplyMatrix4x4(moveMatrix(-center.x, -center.y, -center.z), multiplyMatrix4x4([
        sizeX,      0,      0,     0,
            0,  sizeY,      0,     0,
            0,      0,  sizeZ,     0,
            0,      0,      0,     1
    ], moveMatrix(center.x, center.y, center.z)));
}

function parallelProjection(right, left, top, bottom, near, far) {
    return [
        2 / (right - left),                    0,                  0,  -(right + left) / (right - left),
                         0,   2 / (top - bottom),                  0,  -(top + bottom) / (top - bottom),
                         0,                    0,  -2 / (far - near),      -(far + near) / (far - near),
                         0,                    0,                  0,                                 1
    ]
}

function perspectiveProjection(right, top, near, far) {
    return [
        near / right,                  0,                            0,                               0,
                   0,         near / top,                            0,                               0,
                   0,                  0, -(far + near) / (far - near),  -2 * far * near / (far - near),
                   0,                  0,                           -1,                               0
    ]
}

function plyParser(ply) {
    let lineIndex = 0;
    let vertexCount = 0;
    let indexCount = 0;
    let firstProperty = -1;
    let xIndex = 0;
    let yIndex = 0;
    let zIndex = 0;
    let uIndex = -1;
    let vIndex = -1;

    // parse header
    let lines = ply.split('\n');
    while (!lines[lineIndex].includes("end_header")) {
        if (lines[lineIndex].includes("element vertex")) {
            vertexCount = Number(lines[lineIndex].split(" ")[2]);
        } else if (lines[lineIndex].includes("element face")) {
            indexCount = Number(lines[lineIndex].split(" ")[2]);
        } else if (lines[lineIndex].includes("property")) {
            let property = lines[lineIndex].split(" ")[2];
            if (firstProperty === -1) {
                firstProperty = lineIndex;
            } else if (property === "x") {
                xIndex = lineIndex - firstProperty;
            } else if (property === "y") {
                yIndex = lineIndex - firstProperty;
            } else if (property === "z") {
                zIndex = lineIndex - firstProperty;
            } else if (property === "u" || property === "s") {
                uIndex = lineIndex - firstProperty;
            } else if (property === "v" || property === "t") {
                vIndex = lineIndex - firstProperty;
            }
        }

        lineIndex += 1;
    }
    lineIndex += 1;

    let vertices = new Float32Array(vertexCount * 3);
    let textures = [];
    if (uIndex !== -1 && vIndex !== -1) {
        textures = new Float32Array(vertexCount * 2);
    }
    let indices = new Uint32Array(indexCount * 3);
    let vertexNormals = new Float32Array(vertexCount * 3);
    let triangleNormals = new Array(indexCount);
    let vertexIndexToTriangleIndices = new Array(vertexCount);

    // parse vertices
    let max = 0.0;
    let vertexIndex = 0;
    let textureIndex = 0;
    for (let i = 0; i < vertexCount; i++) {
        let values = lines[i + lineIndex].split(" ");
        let x = Number(values[xIndex]);
        max = Math.max(max, Math.abs(x));
        let y = Number(values[yIndex]);
        max = Math.max(max, Math.abs(y));
        let z = Number(values[zIndex]);
        max = Math.max(max, Math.abs(z));
        if (uIndex !== -1 && vIndex !== -1) {
            let u = Number(values[uIndex]);
            let v = Number(values[vIndex]);
            textures[textureIndex] = u;
            textureIndex += 1;
            textures[textureIndex] = v;
            textureIndex += 1;
        }
        vertices[vertexIndex] = x;
        vertexIndex += 1;
        vertices[vertexIndex] = y;
        vertexIndex += 1;
        vertices[vertexIndex] = z;
        vertexIndex += 1;
    }
    lineIndex += vertexIndex / 3;

    // normalize vertices
    if (max !== 0.0 || max !== 1.0) {
        vertices.forEach((value, index) => {
            vertices[index] = value / max;
        });
    }

    // parse indices
    for (let i = 0; i < indexCount; i++) {
        let line = lines[i + lineIndex].split(" ");
        let count = Number(line[0]);
        let first = Number(line[1]);
        let second = Number(line[2]);
        let third = Number(line[3]);
        indices[i * 3] = first;
        indices[i * 3 + 1] = second;
        indices[i * 3 + 2] = third;

        if (vertexIndexToTriangleIndices[first] === undefined) {
            vertexIndexToTriangleIndices[first] = [i];
        } else {
            vertexIndexToTriangleIndices[first].push(i);
        }
        if (vertexIndexToTriangleIndices[second] === undefined) {
            vertexIndexToTriangleIndices[second] = [i];
        } else {
            vertexIndexToTriangleIndices[second].push(i);
        }
        if (vertexIndexToTriangleIndices[third] === undefined) {
            vertexIndexToTriangleIndices[third] = [i];
        } else {
            vertexIndexToTriangleIndices[third].push(i);
        }

        let firstVertex = {x: vertices[first * 3], y: vertices[first * 3 + 1], z: vertices[first * 3 + 2]};
        let secondVertex = {x: vertices[second * 3], y: vertices[second * 3 + 1], z: vertices[second * 3 + 2]};
        let thirdVertex = {x: vertices[third * 3], y: vertices[third * 3 + 1], z: vertices[third * 3 + 2]};
        triangleNormals[i] = cross(firstVertex, secondVertex, thirdVertex);

        if (count > 3) {
            console.log("panic");
        }
    }

    // compute vertex normals
    for (let i = 0; i < vertexIndexToTriangleIndices.length; i++) {
        let triangles = vertexIndexToTriangleIndices[i];
        if (triangles !== undefined) {
            let averageX = 0.0;
            let averageY = 0.0;
            let averageZ = 0.0;

            triangles.forEach((triangle) => {
                averageX += triangleNormals[triangle].x;
                averageY += triangleNormals[triangle].y;
                averageZ += triangleNormals[triangle].z;
            });

            let normalX = averageX / triangles.length;
            let normalY = averageY / triangles.length;
            let normalZ = averageZ / triangles.length;
            let length = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ);

            if (length > 0) {
                vertexNormals[i * 3] = normalX / length;
                vertexNormals[i * 3 + 1] = normalY / length;
                vertexNormals[i * 3 + 2] = normalZ / length;
            } else {
                vertexNormals[i * 3] = 0;
                vertexNormals[i * 3 + 1] = 0;
                vertexNormals[i * 3 + 2] = 0;
            }
        }
    }

    return {
        vertices: vertices,
        textures: textures,
        indices: indices,
        vertexNormals: vertexNormals,
        center: {x: 0, y: 0, z: 0}
    };
}

function cross(first, second, third) {
    let w = {x: first.x - third.x, y: first.y - third.y, z: first.z - third.z};
    let v = {x: second.x - third.x, y: second.y - third.y, z: second.z - third.z};
    return {x: w.y * v.z - w.z * v.y, y: w.z * v.x - w.x * v.z, z: w.x * v.y - w.y * v.x};
}