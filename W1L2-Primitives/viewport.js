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

function initGL() {
    const canvas = document.getElementById('glCanvas');
    // Using WebGL 2.0
    const gl = canvas.getContext('webgl2');

    if (!gl) {
        alert('Unable to initialize WebGL 2.0');
        return;
    }

    // Create shader program
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Create vertex position buffer
    const positionBuffer = gl.createBuffer();
    const POSITION_LOCATION = 0; // Binding point for position attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        0,  0.5,  // Top vertex     (0)
        -0.5, -0.5,  // Bottom left vertex  (1)
         0.5, -0.5,  // Bottom right vertex (2)
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Create vertex color buffer
    const colorBuffer = gl.createBuffer();
    const COLOR_LOCATION = 1; // Binding point for color attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    const colors = [
        1.0, 0.0, 0.0, 1.0,    // Top - Red
        0.0, 1.0, 0.0, 1.0,    // Bottom left - Green
        0.0, 0.0, 1.0, 1.0,    // Bottom right - Blue 
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Create index buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    // Define vertices order for TRIANGLE_STRIP
    const indices = [
        0, 1, 2  // Order: Top -> Bottom-left -> Bottom-right
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // Create and bind VAO
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Set up vertex position attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(POSITION_LOCATION);
    gl.vertexAttribPointer(POSITION_LOCATION, 2, gl.FLOAT, false, 0, 0);

    // Set up vertex color attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.enableVertexAttribArray(COLOR_LOCATION);
    gl.vertexAttribPointer(COLOR_LOCATION, 4, gl.FLOAT, false, 0, 0);

    // Bind index buffer to VAO
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // Draw the scene
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(shaderProgram);
    gl.bindVertexArray(vao);
    // Draw rectangle using TRIANGLE_STRIP and index buffer
    gl.viewport(0, 0, 320, 240);
    gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);

    gl.viewport(320, 0, 320, 240);
    gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);
    
    gl.viewport(0, 240, 320, 240);
    gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);
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