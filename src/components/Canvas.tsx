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

function draw(
  gl: WebGL2RenderingContext,
  objects: React.MutableRefObject<twgl.DrawObject[]>
) {
  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  twgl.drawObjectList(gl, objects.current);
}

export type CanvasRef = {
  redraw: () => void;
  setObjects: (objects: CanvasObjects) => void;
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
      onResized,
    }: {
      shaders: { vert: string; frag: string };
      onResized?: (size: { width: number; height: number }) => void;
    },
    ref: ForwardedRef<CanvasRef>
  ) => {
    const realRef = useRef<HTMLCanvasElement>(null);
    const redrawRef = useRef<() => void>();
    const drawObjList = useRef<twgl.DrawObject[]>([]);
    const setObjectsRef = useRef<(obj: CanvasObjects) => void>();

    useImperativeHandle(ref, () => ({
      redraw() {
        redrawRef.current?.();
      },
      setObjects(objects: CanvasObjects) {
        setObjectsRef.current?.(objects);
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

      drawObjList.current = [];
      const setDrawObjList = (objects: CanvasObjects) => {
        const list = [];
        for (const obj of objects) {
          const bufferInfo = twgl.createBufferInfoFromArrays(gl, obj.arrays);
          const vaoInfo = twgl.createVertexArrayInfo(
            gl,
            programInfo,
            bufferInfo
          );
          const drawObj = createDrawObject(
            programInfo,
            vaoInfo,
            obj.uniforms,
            gl.TRIANGLES
          );
          list.push(drawObj);
        }
        drawObjList.current = list;
      };
      setObjectsRef.current = setDrawObjList;

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
        setObjectsRef.current = undefined;
        gl.deleteProgram(program);
        console.log('Canvas unmounted.');
      };
    }

    useCanvas(realRef, shaders, onInitialized); // Called on mounted

    return (
      <canvas
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
