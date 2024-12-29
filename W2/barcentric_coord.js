// Vertex shader program - using explicit locations
const vsSource = `#version 300 es
    layout(location = 0) in vec4 aPosition;

    void main() {
        gl_Position = aPosition;
    }
`;

// Fragment shader program - updated for ES 3.0
const fsSource = `#version 300 es
    precision highp float;
    out mediump vec4 fragColor;
    uniform vec2 uVertexPositions[3];
    uniform vec3 uVertexColors[3];
    uniform vec2 uViewportSize;

    void main() {
        // Normalized Device Coordinates of current pixel:
        vec2 p = (gl_FragCoord.xy / uViewportSize) * 2.0 - 1.0;
        p.y = -p.y;
        // Vertex positions in NDC:
        vec2 A = uVertexPositions[0];
        vec2 B = uVertexPositions[1];
        vec2 C = uVertexPositions[2];
        // Length of line segments:
        vec3 PA  = vec3(A - p, 1.0);
        vec3 PB = vec3(B - p, 1.0);
        vec3 PC = vec3(C - p, 1.0);
        vec3 AB = vec3(B - A, 1.0);
        vec3 AC = vec3(C - A, 1.0);
        // Areas of triangles:
        float PAB = length(cross(PA, PB));
        float PBC = length(cross(PB, PC));
        float PCA = length(cross(PC, PA));
        float ABC = length(cross(AB, AC));
        // Weights(Barycentric coordinates):
        float alpha = PBC / ABC;
        float beta = PCA / ABC;
        float gamma = PAB / ABC;
        // Weighted sum:
        mediump vec3 color = alpha * uVertexColors[0] + beta * uVertexColors[1] + gamma * uVertexColors[2];
        fragColor = vec4(color, 1.0);
    }
`;

const positions = [
    0,  0.5,  // Top vertex     (0)
    -0.5, -0.5,  // Bottom left vertex  (1)
     0.5, -0.5,  // Bottom right vertex (2)
];
const colors = [
    1.0, 0.0, 0.0,    // Top - Red
    0.0, 1.0, 0.0,    // Bottom left - Green
    0.0, 0.0, 1.0,    // Bottom right - Blue 
];

let canvas = null;
let gl = null;
let shaderProgram = null;
let uPositions = -1;
let uColors = -1;
let uViewportSize = -1;
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
    // Get locations of uniforms
    uPositions = gl.getUniformLocation(shaderProgram, 'uVertexPositions');
    uColors = gl.getUniformLocation(shaderProgram, 'uVertexColors');
    uViewportSize = gl.getUniformLocation(shaderProgram, 'uViewportSize');

    // Create vertex position buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    // Create index buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    // Define vertices order for TRIANGLE_STRIP
    const indices = [
        0, 1, 2  // Order: Top -> Bottom-left -> Bottom-right
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // Create and bind VAO
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    // Set up vertex position attribute
    const POSITION_LOCATION = 0; // Binding point for vertex position attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.enableVertexAttribArray(POSITION_LOCATION);
    gl.vertexAttribPointer(POSITION_LOCATION, 2, gl.FLOAT, false, 0, 0);

    requestAnimationFrame(draw);
}

function draw() {
    // Draw the scene
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    gl.useProgram(shaderProgram);
    // Set values of uniform arrays
    gl.uniform2fv(uPositions, positions);
    gl.uniform3fv(uColors, colors);
    gl.uniform2f(uViewportSize, canvas.clientWidth, canvas.clientHeight);
    gl.bindVertexArray(vao);
    // Draw rectangle using TRIANGLE_STRIP and index buffer
    gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(draw)
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