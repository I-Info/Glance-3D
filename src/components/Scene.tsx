import Canvas from '@/components/Canvas';
import Camera from '@/engine/Camera';
import vertShader from '@/shaders/main.vert';
import fragShader from '@/shaders/main.frag';
import React from 'react';
import { mat4, vec3 } from 'gl-matrix';
import useRemoteModel from '@/hooks/useModel';
import { STLParser } from '@/engine/loaders/STLParser';
import { css } from '@emotion/react';

export default function Scene({ className }: { className?: string }) {
  const uniforms = React.useRef<{ [key: string]: any } | null>(null);

  const camera = React.useRef<Camera>(new Camera()).current;

  const drawRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('wheel', onWheel);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('keydown', onKeydown);
      document.removeEventListener('wheel', onWheel);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, []); // TODO

  const parser = new STLParser();
  const { model, error, isLoading } = useRemoteModel(
    '/models/teapot/teapot.stl'
  );

  if (isLoading || !model) {
    return <div>loading...</div>;
  } else if (error) {
    return <div>error: {error.message}</div>;
  }

  const geo = parser.parse(model);
  const arrays = geo.getArrays('a_position', 'a_normal');

  camera.near = 10;
  camera.far = 1000;
  camera.position = [0, 0, 100];

  camera.lookAt([0, 0, 0]);

  function calcUniforms() {
    const model = mat4.create();
    mat4.scale(model, model, [10, 10, 10]);

    const modelInverseTranspose = mat4.create();
    mat4.invert(modelInverseTranspose, model);
    mat4.transpose(modelInverseTranspose, modelInverseTranspose);

    const view = camera.getViewMatrix();
    const projection = camera.getPerspectiveMatrix();

    // projection * view * model
    const modelViewProjection = mat4.create();
    mat4.multiply(view, view, model);
    mat4.multiply(modelViewProjection, projection, view);

    const lightDirection: vec3 = [0.5, 0.7, 1];
    vec3.normalize(lightDirection, lightDirection);

    uniforms.current = {
      u_modelInverseTranspose: model,
      u_projection: modelViewProjection,
      u_lightDirection: lightDirection,
      u_color: [1, 1, 1, 1],
    };
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
      case ' ':
        camera.lookAt([0, 0, 0]);
        break;
    }
    onDraw();
  }

  function onWheel(e: WheelEvent) {
    const step = 0.1;
    camera.moveToward(step * e.deltaY);
    onDraw();
  }

  function onMouseDown(e: MouseEvent) {
    if (e.button !== 1) return;
    document.addEventListener('mousemove', onMouseMove);
  }

  function onMouseUp(e: MouseEvent) {
    if (e.button !== 1) return;
    document.removeEventListener('mousemove', onMouseMove);
  }

  function onMouseMove(e: MouseEvent) {
    const step = 0.001;
    camera.rotateY(step * e.movementX);
    camera.rotateX(step * e.movementY);
    onDraw();
  }

  function onDraw() {
    if (!drawRef.current) return;
    calcUniforms();
    drawRef.current();
  }

  function onCanvasReadyToDraw(draw: () => void) {
    drawRef.current = draw;
  }

  function onCanvasUnmounted() {
    drawRef.current = null;
  }

  return (
    <>
      <Canvas
        className={className}
        shaders={{ vert: vertShader, frag: fragShader }}
        arrays={arrays}
        uniformsRef={uniforms}
        onReadyToDraw={onCanvasReadyToDraw}
        onUnmounted={onCanvasUnmounted}
        onResized={onResized}
        css={css`
          border: 1px solid black;
        `}
      />
    </>
  );
}
