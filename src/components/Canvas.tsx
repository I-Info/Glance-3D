import React from 'react';
import WebGLUtils from '@/libs/webgl-utils';
import { isSafari } from '@/libs/browser';
import useCanvas from '@/hooks/useCanvas';
import twgl from '@/libs/twgl';
import { css } from '@emotion/react';

function onResize(
  gl: WebGL2RenderingContext,
  size: { width: number; height: number },
  onRedraw: () => void,
  onResized?: (size: { width: number; height: number }) => void
) {
  if (
    WebGLUtils.resizeCanvas(
      gl.canvas as HTMLCanvasElement,
      size.width,
      size.height
    )
  ) {
    WebGLUtils.updateViewport(gl);
    if (onResized) onResized(size);
  }
  onRedraw();
}

function draw(
  gl: WebGL2RenderingContext,
  programInfo: twgl.ProgramInfo,
  vaoInfo: twgl.VertexArrayInfo,
  uniforms?: { [key: string]: any } | null
) {
  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (uniforms) twgl.setUniforms(programInfo, uniforms);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  gl.useProgram(programInfo.program);
  gl.bindVertexArray(vaoInfo.vertexArrayObject!);

  twgl.drawBufferInfo(gl, vaoInfo, gl.TRIANGLES);
}

export default function Canvas({
  shaders,
  arrays,
  uniformsRef,
  onResized,
  onReadyToDraw,
  onUnmounted,
  className,
}: {
  shaders: { vert: string; frag: string };
  arrays: twgl.Arrays;
  uniformsRef?: React.RefObject<{ [key: string]: any } | null>;
  onResized?: (size: { width: number; height: number }) => void;
  onReadyToDraw?: (draw: () => void) => void;
  onUnmounted?: () => void;
  className?: string;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  function onInitialized(
    canvas: HTMLCanvasElement,
    gl: WebGL2RenderingContext,
    program: WebGLProgram
  ) {
    console.info('Canvas mounted.');

    gl.useProgram(program);
    const programInfo = twgl.createProgramInfoFromProgram(gl, program);

    const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
    const vaoInfo = twgl.createVertexArrayInfo(gl, programInfo, bufferInfo);

    const onRedraw = () => draw(gl, programInfo, vaoInfo, uniformsRef?.current);

    const observer = new ResizeObserver(
      WebGLUtils.canvasOnResizeHandler(
        (w, h) => onResize(gl, { width: w, height: h }, onRedraw, onResized),
        isSafari()
      )
    );
    observer.observe(canvas, { box: 'content-box' });

    onReadyToDraw?.(onRedraw);

    return () => {
      onUnmounted?.();
      observer.disconnect();
      console.log('Canvas unmounted.');
    };
  }

  useCanvas(canvasRef, shaders, onInitialized); // Called on mounted

  return (
    <canvas
      className={className}
      ref={canvasRef}
      css={css`
        width: 100%;
        height: 100%;
        box-sizing: border-box;
      `}
    />
  );
}
