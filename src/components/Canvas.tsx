import React, { useRef } from 'react';
import WebGLUtils from '@/libs/webgl-utils';
import { isSafari } from '@/libs/common';
import useCanvas from '@/hooks/useCanvas';
import twgl from '@/libs/twgl';

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
  uniforms?: React.RefObject<{ [key: string]: any } | undefined>
) {
  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (uniforms?.current) twgl.setUniforms(programInfo, uniforms.current);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  gl.useProgram(programInfo.program);
  gl.bindVertexArray(vaoInfo.vertexArrayObject!);

  twgl.drawBufferInfo(gl, vaoInfo, gl.TRIANGLES);
}

export default function Canvas({
  shaders,
  arrays,
  uniforms,
  onResized,
  style,
}: {
  shaders: { vert: string; frag: string };
  arrays: twgl.Arrays;
  uniforms?: React.RefObject<{ [key: string]: any } | undefined>;
  onResized?: (size: { width: number; height: number }) => void;
  style?: React.CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const onRedraw = () => draw(gl, programInfo, vaoInfo, uniforms);

    const observer = new ResizeObserver(
      WebGLUtils.canvasOnResizeHandler(
        (w, h) => onResize(gl, { width: w, height: h }, onRedraw, onResized),
        isSafari()
      )
    );
    observer.observe(canvas, { box: 'content-box' });

    return () => {
      observer.disconnect();
      console.log('Canvas unmounted.');
    };
  }

  useCanvas(canvasRef, shaders, onInitialized); // Called on mounted

  return (
    <div style={style}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
