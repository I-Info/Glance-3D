import Canvas from '@/components/Canvas';
import vertShader from '@/shaders/main.vert';
import fragShader from '@/shaders/main.frag';
import twgl from '@/libs/twgl';
import { useEffect, useRef } from 'react';
import { GL_STATIC_DRAW, GL_UNSIGNED_BYTE, GL_FLOAT } from '@/libs/webgl-const';
import { mat4 } from 'gl-matrix';
import { Camera } from '@/engine/camera';

export default function Content() {
  const uniforms = useRef<{ [key: string]: any } | null>(null);

  const cameraRef = useRef<Camera>(new Camera());
  const camera = cameraRef.current;

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
          0,   0,  30,
         30,   0,  30,
          0, 150,  30,
          0, 150,  30,
         30,   0,  30,
         30, 150,  30,

        // top rung back
         30,   0,  30,
        100,   0,  30,
         30,  30,  30,
         30,  30,  30,
        100,   0,  30,
        100,  30,  30,

        // middle rung back
         30,  60,  30,
         67,  60,  30,
         30,  90,  30,
         30,  90,  30,
         67,  60,  30,
         67,  90,  30,

        // top
          0,   0,   0,
        100,   0,   0,
        100,   0,  30,
          0,   0,   0,
        100,   0,  30,
          0,   0,  30,

        // top rung right
        100,   0,   0,
        100,  30,   0,
        100,  30,  30,
        100,   0,   0,
        100,  30,  30,
        100,   0,  30,

        // under top rung
        30,   30,   0,
        30,   30,  30,
        100,  30,  30,
        30,   30,   0,
        100,  30,  30,
        100,  30,   0,

        // between top rung and middle
        30,   30,   0,
        30,   60,  30,
        30,   30,  30,
        30,   30,   0,
        30,   60,   0,
        30,   60,  30,

        // top of middle rung
        30,   60,   0,
        67,   60,  30,
        30,   60,  30,
        30,   60,   0,
        67,   60,   0,
        67,   60,  30,

        // right of middle rung
        67,   60,   0,
        67,   90,  30,
        67,   60,  30,
        67,   60,   0,
        67,   90,   0,
        67,   90,  30,

        // bottom of middle rung.
        30,   90,   0,
        30,   90,  30,
        67,   90,  30,
        30,   90,   0,
        67,   90,  30,
        67,   90,   0,

        // right of bottom
        30,   90,   0,
        30,  150,  30,
        30,   90,  30,
        30,   90,   0,
        30,  150,   0,
        30,  150,  30,

        // bottom
        0,   150,   0,
        0,   150,  30,
        30,  150,  30,
        0,   150,   0,
        30,  150,  30,
        30,  150,   0,

        // left side
        0,   0,   0,
        0,   0,  30,
        0, 150,  30,
        0,   0,   0,
        0, 150,  30,
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

  camera.near = 10;
  camera.far = 1000;
  camera.position = [0, 0, -300];

  camera.lookAt([0, 0, 0]);

  function calcUniforms() {
    const model = mat4.create();
    mat4.rotateZ(model, model, Math.PI);

    const view = camera.getViewMatrix();

    const projection = camera.getPerspectiveMatrix();

    // projection * view * model
    const modelViewProjection = mat4.create();
    mat4.multiply(view, view, model);
    mat4.multiply(modelViewProjection, projection, view);
    uniforms.current = { u_transform: modelViewProjection };
  }

  function onResized({ width, height }: { width: number; height: number }) {
    camera.aspect = width / height;
    calcUniforms();
  }

  function onKeydown(e: KeyboardEvent) {
    const step = 5;
    switch (e.key) {
      case 'w':
        camera.moveForward(step);
        break;
      case 's':
        camera.moveBackward(step);
        break;
      case 'a':
        camera.moveLeft(step);
        break;
      case 'd':
        camera.moveRight(step);
        break;
      case 'e':
        camera.moveUp(step);
        break;
      case 'q':
        camera.moveDown(step);
        break;
      case 'ArrowLeft':
        camera.rotateY(0.01);
        break;
      case 'ArrowRight':
        camera.rotateY(-0.01);
        break;
      case 'ArrowUp':
        camera.rotateX(0.01);
        break;
      case 'ArrowDown':
        camera.rotateX(-0.01);
        break;
    }
  }

  function onClick() {
    camera.lookAt([0, 0, 0]);
  }

  useEffect(() => {
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKeydown);
      document.removeEventListener('click', onClick);
    };
  }, []); // TODO

  function animator() {
    calcUniforms();
  }

  return (
    <>
      <Canvas
        shaders={{ vert: vertShader, frag: fragShader }}
        arrays={arrays}
        uniformsRef={uniforms}
        animator={animator}
        onResized={onResized}
        style={{ width: '80vw', height: '80vh', border: 'solid' }}
      />
    </>
  );
}
