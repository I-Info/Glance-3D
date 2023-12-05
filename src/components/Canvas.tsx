import React, { useCallback, useRef } from 'react';
import WebGLUtils from '@/libs/webgl-utils';
import { isSafari } from '@/libs/utils';
import useCanvas from '@/hooks/useCanvas';

function drawScene(gl: WebGL2RenderingContext) {
  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // draw
  const primitiveType = gl.TRIANGLES;
  const offset = 0;
  const count = 3;
  gl.drawArrays(primitiveType, offset, count);
}

function onResize(
  gl: WebGL2RenderingContext,
  size: { width: number; height: number } | undefined = undefined
) {
  if (
    size &&
    WebGLUtils.resizeCanvas(
      gl.canvas as HTMLCanvasElement,
      size.width,
      size.height
    )
  ) {
    WebGLUtils.updateViewport(gl);
  }

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // draw
  drawScene(gl);
}

export default function Canvas({
  shaders,
  style,
}: {
  shaders: { vert: string; frag: string };
  style?: React.CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onInitialized = useCallback(
    (
      canvas: HTMLCanvasElement,
      gl: WebGL2RenderingContext,
      program: WebGLProgram
    ) => {
      const positionAttributeLocation = gl.getAttribLocation(
        program,
        'a_position'
      );
      const positionBuffer = gl.createBuffer();

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      const positions = [-0.5, -0.5, 0.5, -0.5, 0, 0.5];
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW
      );

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

      // Tell it to use our program (pair of shaders)
      gl.useProgram(program);

      // Bind the attribute/buffer set we want.
      gl.bindVertexArray(vao);

      const observer = new ResizeObserver(
        WebGLUtils.canvasOnResizeHandler(
          (w, h) => onResize(gl, { width: w, height: h }),
          isSafari()
        )
      );
      observer.observe(canvas, { box: 'content-box' });

      return () => {
        observer.disconnect();
      };
    },
    []
  );

  useCanvas(canvasRef, shaders, onInitialized);

  return (
    <div style={style}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
