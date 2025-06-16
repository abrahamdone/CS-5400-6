
// noinspection JSVoidFunctionReturnValueUsed

MySample.main = (function() {
    'use strict';

    const canvas = document.getElementById('canvas-main');
    const gl = canvas.getContext('webgl2');

    let object = {};
    let texture = {};
    let eye = [0, 0, 3];
    let diffuseLightPosition = {};
    let diffuseLight = [1, 1, 1];
    let specularLightPosition = {};
    let specularLight = [1, 1, 1];
    let specularN = 1.0;
    let angle = 0;
    let step = 0;

    let shaderProgram = {};
    let indexBuffer = {};

    //------------------------------------------------------------------
    //
    // Scene updates go here.
    //
    //------------------------------------------------------------------
    function update() {
        if (angle > 2 * Math.PI) {
            angle = 0;
        }
        angle += 0.005;

        diffuseLightPosition = [1, 0, 1];
        // diffuseLight = [0, 0, 0];
        specularLightPosition = [1, 0, 1];
        // specularLight = [0, 0, 0];
    }

    //------------------------------------------------------------------
    //
    // Rendering code goes here
    //
    //------------------------------------------------------------------
    function render() {
        gl.clearColor(
            0.3921568627450980392156862745098,
            0.58431372549019607843137254901961,
            0.92941176470588235294117647058824,
            1.0);
        gl.clearDepth(1.0);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let uProjection = gl.getUniformLocation(shaderProgram, 'uProjection');
        gl.uniformMatrix4fv(uProjection, false, transposeMatrix4x4(perspectiveProjection(1, 1, 1, 10)));

        let uView = gl.getUniformLocation(shaderProgram, 'uView');
        gl.uniformMatrix4fv(uView, false, transposeMatrix4x4(moveMatrix(eye[0], eye[1], -eye[2])));

        let model = multiplyMatrix4x4(
            multiplyMatrix4x4(
                moveMatrix(0, -1, 0),
                scaleMatrix(object.center, 1.5, 1.5, 1.5)),
            rotateXZMatrix(object.center, angle)
        );
        let uModel = gl.getUniformLocation(shaderProgram, 'uModel');
        gl.uniformMatrix4fv(uModel, false, transposeMatrix4x4(model));

        let uMaterial = gl.getUniformLocation(shaderProgram, 'uMaterial');
        gl.uniform4fv(uMaterial, [1, 1, 1, 1]);

        let uDiffuseLightPosition = gl.getUniformLocation(shaderProgram, 'uDiffuseLightPosition');
        gl.uniform3fv(uDiffuseLightPosition, diffuseLightPosition);

        let uDiffuseLight = gl.getUniformLocation(shaderProgram, 'uDiffuseLight');
        gl.uniform3fv(uDiffuseLight, diffuseLight);

        let uEye = gl.getUniformLocation(shaderProgram, 'uEye');
        gl.uniform3fv(uEye, eye);

        let uSpecularLightPosition = gl.getUniformLocation(shaderProgram, 'uSpecularLightPosition');
        gl.uniform3fv(uSpecularLightPosition, specularLightPosition);

        let uSpecularLight = gl.getUniformLocation(shaderProgram, 'uSpecularLight');
        gl.uniform3fv(uSpecularLight, specularLight);

        let uSpecularN = gl.getUniformLocation(shaderProgram, 'uSpecularN');
        gl.uniform1f(uSpecularN, specularN);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, object.indices.length, gl.UNSIGNED_INT, 0);
    }

    //------------------------------------------------------------------
    //
    // This is the animation loop.
    //
    //------------------------------------------------------------------
    function animationLoop(time) {

        update();
        render();

        requestAnimationFrame(animationLoop);
    }

    async function initialize() {
        console.log('initializing...');

        const vertexShaderSource = await loadFileFromServer('assets/shaders/simple.vert');
        const diffuseShaderSource = await loadFileFromServer('assets/shaders/diffuse.frag');
        const specularShaderSource = await loadFileFromServer('assets/shaders/specular.frag');
        const combineShaderSource = await loadFileFromServer('assets/shaders/combine.frag');
        // const skyboxObjectSource = await loadFileFromServer('assets/models/skybox.ply');
        // const objectSource = await loadFileFromServer('assets/models/tetrahedron.ply');
        const objectSource = await loadFileFromServer('assets/models/bunny.ply');
        const textureImage = await loadTextureFromServer('assets/textures/bunny.png');

        initializeShaders(vertexShaderSource, combineShaderSource);
        // let skybox = plyParser(skyboxObjectSource);
        object = plyParser(objectSource);
        initializeBufferObjects(object, textureImage);

        requestAnimationFrame(animationLoop);
    }

    function initializeBufferObjects(object, textureImage) {
        let vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, object.vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, object.indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        let vertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, object.vertexNormals, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        let textureCoordsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, object.textures, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        let textureBuffer = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordsBuffer);

        let texCoord = gl.getAttribLocation(shaderProgram, 'aTexCoord');
        gl.enableVertexAttribArray(texCoord);
        gl.vertexAttribPointer(texCoord, 2, gl.FLOAT, false, object.textures.BYTES_PER_ELEMENT * 2, 0);
        let samplerLocation = gl.getUniformLocation(shaderProgram, 'uSampler');
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
        gl.uniform1i(samplerLocation, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        let position = gl.getAttribLocation(shaderProgram, 'aPosition');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 3, gl.FLOAT, false, object.vertices.BYTES_PER_ELEMENT * 3, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
        let normal = gl.getAttribLocation(shaderProgram, 'aNormal');
        gl.enableVertexAttribArray(normal);
        gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, object.vertexNormals.BYTES_PER_ELEMENT * 3, 0);
    }

    function initializeShaders(vertexShaderSource, fragmentShaderSource) {
        let vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);
        console.log(gl.getShaderInfoLog(vertexShader)); // for debugging

        let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);
        console.log(gl.getShaderInfoLog(fragmentShader));

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        gl.useProgram(shaderProgram);
    }

    initialize();

}());
