// Vertex shader program - using explicit locations
const vsSource = `#version 300 es
    layout(location = 0) in vec4 aVertexPosition;
    layout(location = 1) in vec4 aVertexColor;
    out vec4 vColor;
    void main() {
        gl_Position = aVertexPosition;
        vColor = aVertexColor;
    }
`;
// Fragment shader program - updated for ES 3.0
const fsSource = `#version 300 es
    precision mediump float;
    in vec4 vColor;
    out vec4 fragColor;
    void main() {
        fragColor = vColor;
    }
`;

let canvas = null;
let gl = null;
let shaderProgram = null;
let vao = null;

function initGL() {
    canvas = document.getElementById('glCanvas');
    // Using WebGL 2.0
    gl = canvas.getContext('webgl2');
    if (!gl) {
        alert('Unable to initialize WebGL 2.0');
        return;
    }

    // Create shader program
    shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Create vertex buffer
    const CellSize = 60.0;
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    let vertices = [
        0, 0, // positions[0]
        2, 1, 0, // colors[0]
        CellSize, 0, // positions[1]
        2, 1, 0, // colors[1]
        CellSize, -CellSize, // positions[2]
        3, 0, 0, // colors[2]
        -CellSize, -CellSize, // positions[3]
        3, 0, 0, // colors[3]
        -CellSize, 2 * CellSize, // positions[4]
        0, 3, 0, // colors[4]
        0, 2 * CellSize, // positions[5]
        0, 3, 0 // colors[6]
    ];
    const HalfW = canvas.width / 2
    const HalfH = canvas.height / 2
    for (let i = 0; i < vertices.length; i += 5) {
        vertices[i] /= HalfW;
        vertices[i + 1] /= HalfH;
        vertices[i + 2] /= 3;
        vertices[i + 3] /= 3;
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Create index buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    // Define vertices order for TRIANGLE_STRIP
    const indices = [
        0, 1, 2, 3, 4, 5
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // Create and bind VAO
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const SizeOfFloat = 4
    // Set up vertex position attribute
    const POSITION_LOCATION = 0; // Binding point for position attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.enableVertexAttribArray(POSITION_LOCATION);
    gl.vertexAttribPointer(POSITION_LOCATION, 2, gl.FLOAT, false, SizeOfFloat * 5, 0);

    // Set up vertex color attribute
    const COLOR_LOCATION = 1; // Binding point for color attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.enableVertexAttribArray(COLOR_LOCATION);
    gl.vertexAttribPointer(COLOR_LOCATION, 3, gl.FLOAT, false, SizeOfFloat * 5, SizeOfFloat * 2);

    // Bind index buffer to VAO
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // Now we can reset the VAO binding state
    gl.bindVertexArray(null);

    requestAnimationFrame(drawScene);
}

// Draw the scene
function drawScene() {
    // Set viewport
    gl.viewport(0, 0, canvas.width, canvas.height);
    // Draw the scene
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(shaderProgram);
    gl.bindVertexArray(vao);
    // Draw rectangle using TRIANGLE_STRIP and index buffer
    gl.drawElements(gl.TRIANGLE_FAN, 6, gl.UNSIGNED_SHORT, 0);

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