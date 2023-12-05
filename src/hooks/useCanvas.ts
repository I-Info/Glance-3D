import WebGLUtils from '@/libs/webgl-utils';
import React, { useEffect } from 'react';

export default function useCanvas(
  ref: React.RefObject<HTMLCanvasElement>,
  shaders: {
    vert: string;
    frag: string;
  },
  onSuccess: (
    canvas: HTMLCanvasElement,
    gl: WebGL2RenderingContext,
    program: WebGLProgram
  ) => () => void
): void {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) throw new Error('Canvas not found');

    const gl = canvas.getContext('webgl2');
    if (!gl) throw new Error('WebGL2 not supported');

    const vertexShader = WebGLUtils.compileShader(
      gl,
      shaders.vert,
      gl.VERTEX_SHADER
    );

    const fragmentShader = WebGLUtils.compileShader(
      gl,
      shaders.frag,
      gl.FRAGMENT_SHADER
    );

    const program = WebGLUtils.createProgram(gl, vertexShader, fragmentShader);

    return onSuccess(canvas, gl, program);
  }, [ref, shaders, onSuccess]);
}
