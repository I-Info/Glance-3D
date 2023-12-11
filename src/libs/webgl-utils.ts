function browserZoomLevel(): number {
  const ratioX = window.outerWidth / window.innerWidth;
  const ratioY = window.outerHeight / window.innerHeight;
  return Math.min(ratioX, ratioY);
}

/**
 * Creates and compiles a shader.
 *
 * @param {!WebGL2RenderingContext} gl The WebGL Context.
 * @param {!string} shaderSource The GLSL source code for the shader.
 * @param {!number} shaderType The type of shader, VERTEX_SHADER or
 *     FRAGMENT_SHADER.
 * @return {!WebGLShader} The shader.
 */
function compileShader(
  gl: WebGL2RenderingContext,
  shaderSource: string,
  shaderType: number
): WebGLShader {
  // Create the shader object
  const shader = gl.createShader(shaderType);
  if (!shader) throw new Error('Failed to create shader.');

  // Set the shader source code.
  gl.shaderSource(shader, shaderSource);

  // Compile the shader
  gl.compileShader(shader);

  // Check if it compiled
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    // Something went wrong during compilation; get the error
    throw new Error('Could not compile shader:' + gl.getShaderInfoLog(shader));
  }

  return shader;
}

/**
 * Creates a program from 2 shaders.
 *
 * @param {!WebGL2RenderingContext} gl The WebGL context.
 * @param {!WebGLShader} vertexShader A vertex shader.
 * @param {!WebGLShader} fragmentShader A fragment shader.
 * @return {!WebGLProgram} A program.
 */
function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram {
  // create a program.
  const program = gl.createProgram();
  if (!program) throw 'Failed to create program.';

  // attach the shaders.
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // link the program.
  gl.linkProgram(program);

  // Check if it linked.
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    // something went wrong with the link; get the error
    throw new Error('Program failed to link:' + gl.getProgramInfoLog(program));
  }

  return program;
}

/**
 * Resize a canvas to match the size its displayed.
 * @param {HTMLCanvasElement} canvas The canvas to resize.
 * @param {number} [width]
 * @param {number} [height]
 * @return {boolean} true if the canvas was resized.
 */
function resizeCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): boolean {
  // Check if the canvas is not the same size.
  const needResize = canvas.width !== width || canvas.height !== height;

  if (needResize) {
    // Make the canvas the same size
    canvas.width = width;
    canvas.height = height;
  }

  return needResize;
}

function canvasOnResizeHandler(
  callback: (width: number, height: number) => void,
  isSafari: boolean = false
): ResizeObserverCallback {
  return (entries: ResizeObserverEntry[], _: ResizeObserver) => {
    for (const entry of entries) {
      let width;
      let height;
      let dpr = window.devicePixelRatio;

      if (entry.devicePixelContentBoxSize) {
        // NOTE: Only this path gives the correct answer
        // The other 2 paths are an imperfect fallback
        // for browsers that don't provide anyway to do this
        width = entry.devicePixelContentBoxSize[0].inlineSize;
        height = entry.devicePixelContentBoxSize[0].blockSize;
        dpr = 1; // it's already in width and height
      } else {
        // TODO: Remove this once Safari support devicePixelContentBoxSize
        // or DPR can change when zooming on Safari.
        if (isSafari) dpr *= browserZoomLevel();

        if (entry.contentBoxSize) {
          if (entry.contentBoxSize[0]) {
            width = entry.contentBoxSize[0].inlineSize;
            height = entry.contentBoxSize[0].blockSize;
          } else {
            throw new Error('Unexpected contentBoxSize.');
          }
        } else {
          // legacy
          width = entry.contentRect.width;
          height = entry.contentRect.height;
        }
      }

      const displayWidth = Math.round(width * dpr);
      const displayHeight = Math.round(height * dpr);
      callback(displayWidth, displayHeight);
    }
  };
}

/**
 * Used to update the viewport when the canvas is resized.
 */
function updateViewport(gl: WebGL2RenderingContext) {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
}

const Defaults = {
  compileShader,
  createProgram,
  resizeCanvas,
  canvasOnResizeHandler,
  updateViewport,
};

export default Defaults;
