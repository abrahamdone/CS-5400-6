
// noinspection JSVoidFunctionReturnValueUsed

MySample.main = (function() {
    'use strict';

    const canvas = document.getElementById('canvas-main');
    const gl = canvas.getContext('webgl2');

    let object1 = {};
    let object2 = {};
    let currentObject = {};
    let redLightPosition = {};
    let redLightLum = 1;
    let greenLightPosition = {};
    let greenLightLum = 1;
    let blueLightPosition = {};
    let blueLightLum = 1;
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
        if (step === 0) {
            currentObject = object1;
            initializeBufferObjects();
        } else if (step === 1000) {
            currentObject = object2;
            initializeBufferObjects();
        } else if (step === 2000) {
            step = -1;
        }
        let lightOff = step / 400;
        if (lightOff > 1 && lightOff < 2) {
            redLightLum = 0;
        } else if (lightOff > 2 && lightOff < 3) {
            greenLightLum = 0;
        } else if (lightOff > 3 && lightOff < 4) {
            blueLightLum = 0;
        } else {
            redLightLum = 1;
            greenLightLum = 1;
            blueLightLum = 1;
        }
        step++;

        if (angle > 2 * Math.PI) {
            angle = 0;
        }
        angle += 0.005;

        redLightPosition = [1, 0, 0];
        greenLightPosition = [0, 0, 1];
        blueLightPosition = [-1, 0, 0];
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
        gl.uniformMatrix4fv(uView, false, transposeMatrix4x4(moveMatrix(0, 0, -3)));

        let model = multiplyMatrix4x4(
            multiplyMatrix4x4(
                moveMatrix(0, -1, 0),
                scaleMatrix(currentObject.center, 1.5, 1.5, 1.5)),
            rotateXZMatrix(currentObject.center, angle)
        );
        let uModel = gl.getUniformLocation(shaderProgram, 'uModel');
        gl.uniformMatrix4fv(uModel, false, transposeMatrix4x4(model));

        let uMaterial = gl.getUniformLocation(shaderProgram, 'uMaterial');
        gl.uniform4fv(uMaterial, [1, 1, 1, 1]);

        let uRedLight = gl.getUniformLocation(shaderProgram, 'uRedLight');
        gl.uniform3fv(uRedLight, redLightPosition);

        let uRedLum = gl.getUniformLocation(shaderProgram, 'uRedLum');
        gl.uniform1f(uRedLum, redLightLum);

        let uGreenLight = gl.getUniformLocation(shaderProgram, 'uGreenLight');
        gl.uniform3fv(uGreenLight, greenLightPosition);

        let uGreenLum = gl.getUniformLocation(shaderProgram, 'uGreenLum');
        gl.uniform1f(uGreenLum, greenLightLum);

        let uBlueLight = gl.getUniformLocation(shaderProgram, 'uBlueLight');
        gl.uniform3fv(uBlueLight, blueLightPosition);

        let uBlueLum = gl.getUniformLocation(shaderProgram, 'uBlueLum');
        gl.uniform1f(uBlueLum, blueLightLum);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, currentObject.indices.length, gl.UNSIGNED_INT, 0);
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
        const fragmentShaderSource = await loadFileFromServer('assets/shaders/simple.frag');
        const object1Source = await loadFileFromServer('assets/models/happy_vrip.ply');
        // const object1Source = await loadFileFromServer('assets/models/happy_vrip_res2.ply');
        // const object1Source = await loadFileFromServer('assets/models/happy_vrip_res3.ply');
        // const object1Source = await loadFileFromServer('assets/models/happy_vrip_res4.ply');
        const object2Source = await loadFileFromServer('assets/models/bun_zipper.ply');
        // const object2Source = await loadFileFromServer('assets/models/bun_zipper_res2.ply');
        // const object2Source = await loadFileFromServer('assets/models/bun_zipper_res3.ply');
        // const object2Source = await loadFileFromServer('assets/models/bun_zipper_res4.ply');
        // const testObjectSource = await loadFileFromServer('assets/models/tetrahedron.ply');

        initializeShaders(vertexShaderSource, fragmentShaderSource);
        object1 = plyParser(object1Source);
        object2 = plyParser(object2Source);
        currentObject = object2;
        initializeBufferObjects();

        requestAnimationFrame(animationLoop);
    }

    function initializeBufferObjects() {
        let vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, currentObject.vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, currentObject.indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        let vertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, currentObject.vertexNormals, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        let position = gl.getAttribLocation(shaderProgram, 'aPosition');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 3, gl.FLOAT, false, currentObject.vertices.BYTES_PER_ELEMENT * 3, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
        let normal = gl.getAttribLocation(shaderProgram, 'aNormal');
        gl.enableVertexAttribArray(normal);
        gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, currentObject.vertexNormals.BYTES_PER_ELEMENT * 3, 0);
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
