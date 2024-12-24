let canvas;
// Global WebGL context
let gl;
// Store program and buffer objects
let program = 0;
let vao = 0;
let vertexBuffer = 0;
let vertexCount = 0;

// Vertex shader program - GLSL 330
const vsSource = `#version 300 es
    layout(location = 0) in vec2 aVertexPosition;
    layout(location = 1) in vec2 aVertexColor;
    out vec2 color;
    void main() {
        gl_Position = vec4(aVertexPosition, 0.0, 1.0);
        color = aVertexColor;
    }
`;

// Fragment shader program - GLSL 330
const fsSource = `#version 300 es
    precision mediump float;
    in vec2 color;
    out vec4 fragColor;
    void main() {
        fragColor = vec4(color, 0.0, 1.0);
    }
`;

// Initialize WebGL context and create all objects
function initGL() {
    canvas = document.getElementById('glCanvas');
    gl = canvas.getContext('webgl2');

    if (!gl) {
        alert('Unable to initialize WebGL 2.0');
        return;
    }
    // Initialize shaders and program
    program = initShaderProgram(gl, vsSource, fsSource);
    // Generate circle vertices
    const segments = 32;
    const radius = 0.5;
    const vertexData = [0.0, 0.0, 1.0, 0.5]; // Center point

    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * 2.0 * Math.PI;
        const x = radius * Math.cos(theta);
        const y = radius * Math.sin(theta);
        const r = (Math.cos(theta) + 1.0) * 0.5;
        const g = (Math.sin(theta) + 1.0) * 0.5;
        vertexData.push(x, y, r, g);
    }
    const sizeOfFloat = 4;
    const stride = sizeOfFloat * 4;
    // Create and set up VAO
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    // Create and set up buffers
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(
        0,
        2,
        gl.FLOAT,
        false,
        stride,
        0
    );
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(
        1,
        2,
        gl.FLOAT,
        false,
        stride,
        sizeOfFloat * 2
    );
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    // Store vertex count for drawing
    vertexCount = segments + 2;
    // Start render loop
    requestAnimationFrame(drawScene);
}

// Draw the scene
function drawScene() {
    // Set viewport
    gl.viewport(0, 0, canvas.width, canvas.height);
    // Clear the canvas
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Use shader program
    gl.useProgram(program);
    // Bind VAO
    gl.bindVertexArray(vao);
    // Draw circle
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexCount);

    // Request next frame
    requestAnimationFrame(drawScene);
}

// Initialize shader program
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

// Create shader
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('Shader compilation error: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// Start after page loads
window.onload = initGL;