import React, { useEffect, useRef } from 'react';
import WebGLUtils from '@/libs/webgl-utils';
import { isSafari } from '@/libs/utils';

const vertexShaderSource = `#version 300 es
 
// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
 
// all shaders have a main function
void main() {
 
  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = a_position;
}
`;

const fragmentShaderSource = `#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;
 
// we need to declare an output for the fragment shader
out vec4 outColor;
 
void main() {
  // Just set the output to a constant reddish-purple
  outColor = vec4(1, 0, 0.5, 1);
}
`;

export default function TestNode() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const glRef: React.MutableRefObject<WebGL2RenderingContext | null> =
    useRef(null);

  function drawScene(size: { width: number; height: number } | null = null) {
    const gl = glRef.current!;

    // Tell WebGL how to convert from clip space to pixels
    if (
      size &&
      WebGLUtils.resizeCanvas(
        gl.canvas as HTMLCanvasElement,
        size.width,
        size.height
      )
    ) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }

    // draw
    const primitiveType = gl.TRIANGLES;
    const offset = 0;
    const count = 3;
    gl.drawArrays(primitiveType, offset, count);
  }

  useEffect(() => {
    const canvas = canvasRef.current!;

    const gl = canvas.getContext('webgl2');
    if (!gl) {
      console.log('WebGL2 not supported');
      return;
    }

    glRef.current = gl;

    const vertexShader = WebGLUtils.compileShader(
      gl,
      vertexShaderSource,
      gl.VERTEX_SHADER
    );

    const fragmentShader = WebGLUtils.compileShader(
      gl,
      fragmentShaderSource,
      gl.FRAGMENT_SHADER
    );

    const program = WebGLUtils.createProgram(gl, vertexShader, fragmentShader);

    const positionAttributeLocation = gl.getAttribLocation(
      program,
      'a_position'
    );
    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [0, 0, 0, 0.5, 0.7, 0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Create a vertex array object (attribute state)
    const vao = gl.createVertexArray();

    // and make it the one we're currently working with
    gl.bindVertexArray(vao);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    const size = 2; // 2 components per iteration
    const type = gl.FLOAT; // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    let offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionAttributeLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    const observer = new ResizeObserver(
      WebGLUtils.canvasOnResizeHandler(drawScene, isSafari())
    );
    observer.observe(canvas, { box: 'content-box' });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <p>Canvas here:</p>
      <canvas
        ref={canvasRef}
        style={{ width: '80vw', height: '80vh' }}
      ></canvas>
    </>
  );
}
