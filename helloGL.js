
function initGL() {
    // Get the canvas
    const canvas = document.getElementById("glCanvas");
    // Initialize the GL context
    const gl = canvas.getContext("webgl");
    // Only continue if WebGL is available
    if (!gl) {
        alert("Your browser does not support WebGL.");
    }
    // Set color buffer to red (1,0,0) and opaque (1)
    gl.clearColor(0, 1, 0, 1);
    //Set the color with the color buffer
    gl.clear(gl.COLOR_BUFFER_BIT);
}

window.onload = initGL;
