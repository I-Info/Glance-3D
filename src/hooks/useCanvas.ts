import { RefObject, useEffect } from 'react';
import twgl from '@/libs/twgl';

export default function useCanvas(
  ref: RefObject<HTMLCanvasElement>,
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
    if (!canvas) throw new Error('Canvas not found.');

    const gl = twgl.getContext(canvas) as WebGL2RenderingContext;
    if (!gl || !twgl.isWebGL2(gl)) throw new Error('WebGL2 not supported.');

    const program = twgl.createProgram(gl, [shaders.vert, shaders.frag]);
    if (!program) throw new Error('Failed to create program.');

    return onSuccess(canvas, gl, program);
  }, [ref, shaders, onSuccess]);
}
