import Canvas from '@/components/Canvas';
import vertShader from '@/shaders/main.vert';
import fragShader from '@/shaders/main.frag';
import { GL_STATIC_DRAW, GL_UNSIGNED_BYTE, GL_FLOAT } from '@/libs/webgl-const';
import twgl from '@/libs/twgl';
import { useEffect, useRef } from 'react';
import { mat4 } from 'gl-matrix';
import { ortho } from '@/libs/math';

export default function Content() {
  const uniforms = useRef<{ [key: string]: any } | undefined>(undefined);

  const arrays: twgl.Arrays = {
    a_position: {
      numComponents: 3,
      // prettier-ignore
      data: [
        // left column front
        0,   0,  0,
        0, 150,  0,
        30,   0,  0,
        0, 150,  0,
        30, 150,  0,
        30,   0,  0,

        // top rung front
        30,   0,  0,
        30,  30,  0,
        100,   0,  0,
        30,  30,  0,
        100,  30,  0,
        100,   0,  0,

        // middle rung front
        30,  60,  0,
        30,  90,  0,
        67,  60,  0,
        30,  90,  0,
        67,  90,  0,
        67,  60,  0,

        // left column back
          0,   0,  -30,
         30,   0,  -30,
          0, 150,  -30,
          0, 150,  -30,
         30,   0,  -30,
         30, 150,  -30,

        // top rung back
         30,   0,  -30,
        100,   0,  -30,
         30,  30,  -30,
         30,  30,  -30,
        100,   0,  -30,
        100,  30,  -30,

        // middle rung back
         30,  60,  -30,
         67,  60,  -30,
         30,  90,  -30,
         30,  90,  -30,
         67,  60,  -30,
         67,  90,  -30,

        // top
          0,   0,   0,
        100,   0,   0,
        100,   0,  -30,
          0,   0,   0,
        100,   0,  -30,
          0,   0,  -30,

        // top rung right
        100,   0,   0,
        100,  30,   0,
        100,  30,  -30,
        100,   0,   0,
        100,  30,  -30,
        100,   0,  -30,

        // under top rung
        30,   30,   0,
        30,   30,  -30,
        100,  30,  -30,
        30,   30,   0,
        100,  30,  -30,
        100,  30,   0,

        // between top rung and middle
        30,   30,   0,
        30,   60,  -30,
        30,   30,  -30,
        30,   30,   0,
        30,   60,   0,
        30,   60,  -30,

        // top of middle rung
        30,   60,   0,
        67,   60,  -30,
        30,   60,  -30,
        30,   60,   0,
        67,   60,   0,
        67,   60,  -30,

        // right of middle rung
        67,   60,   0,
        67,   90,  -30,
        67,   60,  -30,
        67,   60,   0,
        67,   90,   0,
        67,   90,  -30,

        // bottom of middle rung.
        30,   90,   0,
        30,   90,  -30,
        67,   90,  -30,
        30,   90,   0,
        67,   90,  -30,
        67,   90,   0,

        // right of bottom
        30,   90,   0,
        30,  150,  -30,
        30,   90,  -30,
        30,   90,   0,
        30,  150,   0,
        30,  150,  -30,

        // bottom
        0,   150,   0,
        0,   150,  -30,
        30,  150,  -30,
        0,   150,   0,
        30,  150,  -30,
        30,  150,   0,

        // left side
        0,   0,   0,
        0,   0,  -30,
        0, 150,  -30,
        0,   0,   0,
        0, 150,  -30,
        0, 150,   0,
    ],
      drawType: GL_STATIC_DRAW,
      type: GL_FLOAT,
    },
    a_color: {
      numComponents: 3,
      // prettier-ignore
      data: [
        // left column front
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,

        // top rung front
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,

        // middle rung front
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,
      200,  70, 120,

        // left column back
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,

        // top rung back
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,

        // middle rung back
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,
      80, 70, 200,

        // top
      70, 200, 210,
      70, 200, 210,
      70, 200, 210,
      70, 200, 210,
      70, 200, 210,
      70, 200, 210,

        // top rung right
      200, 200, 70,
      200, 200, 70,
      200, 200, 70,
      200, 200, 70,
      200, 200, 70,
      200, 200, 70,

        // under top rung
      210, 100, 70,
      210, 100, 70,
      210, 100, 70,
      210, 100, 70,
      210, 100, 70,
      210, 100, 70,

        // between top rung and middle
      210, 160, 70,
      210, 160, 70,
      210, 160, 70,
      210, 160, 70,
      210, 160, 70,
      210, 160, 70,

        // top of middle rung
      70, 180, 210,
      70, 180, 210,
      70, 180, 210,
      70, 180, 210,
      70, 180, 210,
      70, 180, 210,

        // right of middle rung
      100, 70, 210,
      100, 70, 210,
      100, 70, 210,
      100, 70, 210,
      100, 70, 210,
      100, 70, 210,

        // bottom of middle rung.
      76, 210, 100,
      76, 210, 100,
      76, 210, 100,
      76, 210, 100,
      76, 210, 100,
      76, 210, 100,

        // right of bottom
      140, 210, 80,
      140, 210, 80,
      140, 210, 80,
      140, 210, 80,
      140, 210, 80,
      140, 210, 80,

        // bottom
      90, 130, 110,
      90, 130, 110,
      90, 130, 110,
      90, 130, 110,
      90, 130, 110,
      90, 130, 110,

        // left side
      160, 160, 220,
      160, 160, 220,
      160, 160, 220,
      160, 160, 220,
      160, 160, 220,
      160, 160, 220,
    ],
      drawType: GL_STATIC_DRAW,
      type: GL_UNSIGNED_BYTE,
      normalize: true,
    },
  };

  function onResized({ width, height }: { width: number; height: number }) {
    const transform = mat4.create();

    ortho(transform, 0, width, height, 0, 200, -200);
    mat4.translate(transform, transform, [width / 2, height / 2, 0]);
    mat4.rotate(transform, transform, Math.PI / 4, [1, 1, 1]);
    mat4.scale(transform, transform, [2, 2, 2]);

    uniforms.current = { u_transform: transform };
  }

  return (
    <>
      <Canvas
        shaders={{ vert: vertShader, frag: fragShader }}
        arrays={arrays}
        uniforms={uniforms}
        onResized={onResized}
        style={{ width: '80vw', height: '80vh', border: 'solid' }}
      />
    </>
  );
}
