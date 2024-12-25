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

    // Create vertex position buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        -0.5,  0.5,  // Top left vertex     (0)
         0.5,  0.5,  // Top right vertex    (1)
        -0.5, -0.5,  // Bottom left vertex  (2)
         0.5, -0.5,  // Bottom right vertex (3)
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Create vertex color buffer
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    const colors = [
        1.0, 0.0, 0.0, 1.0,    // Top left - Red
        0.0, 1.0, 0.0, 1.0,    // Top right - Green
        0.0, 0.0, 1.0, 1.0,    // Bottom left - Blue
        1.0, 1.0, 0.0, 1.0,    // Bottom right - Yellow
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Create index buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    // Define vertices order for TRIANGLE_STRIP
    const indices = [
        0, 1, 2, 3  // Order: Top-left -> Top-right -> Bottom-left -> Bottom-right
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // Create and bind VAO
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Set up vertex position attribute
    const POSITION_LOCATION = 0; // Binding point for position attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(POSITION_LOCATION);
    gl.vertexAttribPointer(POSITION_LOCATION, 2, gl.FLOAT, false, 0, 0);

    // Set up vertex color attribute
    const COLOR_LOCATION = 1; // Binding point for color attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.enableVertexAttribArray(COLOR_LOCATION);
    gl.vertexAttribPointer(COLOR_LOCATION, 4, gl.FLOAT, false, 0, 0);

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
    gl.drawElements(gl.TRIANGLE_STRIP, 4, gl.UNSIGNED_SHORT, 0);

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