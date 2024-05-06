import React, {
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
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

function draw(gl: WebGL2RenderingContext, objects: twgl.DrawObject[]) {
  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  twgl.drawObjectList(gl, objects);
}

export type CanvasRef = {
  redraw: () => void;
  this: HTMLCanvasElement;
};

export type CanvasObjects = {
  arrays: twgl.Arrays;
  uniforms: { [key: string]: any };
}[];

export const Canvas = forwardRef(
  (
    {
      shaders,
      objRef,
      onResized,
      className,
    }: {
      shaders: { vert: string; frag: string };
      objRef: React.RefObject<CanvasObjects>;
      onResized?: (size: { width: number; height: number }) => void;
      className?: string;
    },
    ref: ForwardedRef<CanvasRef>
  ) => {
    const realRef = useRef<HTMLCanvasElement>(null);
    const redrawRef = useRef<() => void>();

    useImperativeHandle(ref, () => ({
      redraw() {
        redrawRef.current?.();
      },
      this: realRef.current!,
    }));

    function onInitialized(
      canvas: HTMLCanvasElement,
      gl: WebGL2RenderingContext,
      program: WebGLProgram
    ) {
      console.info('Canvas mounted.');

      gl.useProgram(program);
      const programInfo = twgl.createProgramInfoFromProgram(gl, program);

      let drawObjList: twgl.DrawObject[] = [];
      for (const obj of objRef.current!) {
        const bufferInfo = twgl.createBufferInfoFromArrays(gl, obj.arrays);
        const vaoInfo = twgl.createVertexArrayInfo(gl, programInfo, bufferInfo);
        const drawObj = createDrawObject(
          programInfo,
          vaoInfo,
          obj.uniforms,
          gl.TRIANGLES
        );
        drawObjList.push(drawObj);
      }

      const onRedraw = () => draw(gl, drawObjList);
      redrawRef.current = onRedraw;

      const observer = new ResizeObserver(
        WebGLUtils.canvasOnResizeHandler(
          (w, h) => onResize(gl, { width: w, height: h }, onRedraw, onResized),
          isSafari()
        )
      );
      observer.observe(canvas, { box: 'content-box' });

      return () => {
        observer.disconnect();
        redrawRef.current = undefined;
        console.log('Canvas unmounted.');
      };
    }

    useCanvas(realRef, shaders, onInitialized); // Called on mounted

    return (
      <canvas
        className={className}
        ref={realRef}
        css={css`
          width: 100%;
          height: 100%;
        `}
      />
    );
  }
);

function createDrawObject(
  programInfo: twgl.ProgramInfo,
  vaoInfo: twgl.VertexArrayInfo,
  uniforms: { [key: string]: any },
  type: number = WebGL2RenderingContext.TRIANGLES,
  offset?: number,
  count?: number,
  instanceCount?: number
) {
  return {
    active: true,
    type: type,
    programInfo: programInfo,
    // bufferInfo:
    vertexArrayInfo: vaoInfo,
    uniforms: uniforms,
    offset: offset,
    count: count,
    instanceCount: instanceCount,
  };
}

Canvas.displayName = 'Canvas';
