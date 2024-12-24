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
    layout(location = 0) in vec4 aVertexPosition;
    void main() {
        gl_Position = aVertexPosition;
    }
`;

// Fragment shader program - GLSL 330
const fsSource = `#version 300 es
    precision mediump float;
    out vec4 fragColor;
    void main() {
        fragColor = vec4(1.0, 0.0, 0.0, 1.0);
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
    const positions = [0.0, 0.0]; // Center point

    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * 2.0 * Math.PI;
        const x = radius * Math.cos(theta);
        const y = radius * Math.sin(theta);
        positions.push(x, y);
    }
    // Create and set up VAO
    // vao = gl.createVertexArray();
    // gl.bindVertexArray(vao);
    // Create and set up buffers
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(
        0,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );
    // gl.bindVertexArray(0);
    // gl.bindBuffer(gl.ARRAY_BUFFER, 0);
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
    gl.clearColor(0.0, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Use shader program
    gl.useProgram(program);
    // Bind VAO
    // gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
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