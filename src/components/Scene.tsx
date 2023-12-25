import { Canvas, CanvasRef } from '@/components/Canvas';
import Camera from '@/engine/Camera';
import shader from '@/shaders/main';
import React from 'react';
import { mat4, vec3 } from 'gl-matrix';
import { css } from '@emotion/react';
import { TrackballRotator } from '@/engine/TrackballRotator';
import Geometry from '@/engine/Geometry';

export default function Scene({
  geometry,
  className,
}: {
  geometry: Geometry;
  className?: string;
}) {
  const canvasRef = React.useRef<CanvasRef>(null);
  const rotatorRef = React.useRef<TrackballRotator | null>(null);

  const camera = React.useRef<Camera>(new Camera()).current;
  const uniforms = React.useRef<{ [key: string]: any } | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current!.this;
    rotatorRef.current = new TrackballRotator(canvas);
    document.addEventListener('keydown', onKeydown);
    canvas.addEventListener('wheel', onWheel);
    canvas.addEventListener('mousedown', onMouseDown);
    return () => {
      rotatorRef.current = null;
      document.removeEventListener('keydown', onKeydown);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('mousedown', onMouseDown);
    };
  }, []); // TODO

  const arrays = geometry.getArrays('a_position', 'a_normal');

  camera.near = 10;
  camera.far = 1000;
  camera.position = [0, 0, 100];

  camera.lookAt([0, 0, 0]);

  function calcUniforms() {
    const model = mat4.translate(mat4.create(), mat4.create(), [0, -10, 0]);
    const rotate = rotatorRef.current!.matrix;
    mat4.multiply(model, rotate, model);
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

    const lightDirection: vec3 = camera.getAxisZ();

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
      case 'r':
        camera.position = [0, 0, 100];
        camera.lookAt([0, 0, 0]);
        break;
    }
    redraw();
  }

  function onWheel(e: WheelEvent) {
    const step = 0.1;
    camera.zoomIn(step * e.deltaY);
    redraw();
  }

  function onMouseDown(e: MouseEvent) {
    switch (e.button) {
      case 0:
        onMouseDown0(e);
        break;
      case 1:
        onMouseDown1(e);
        break;
    }
  }

  function onMouseDown0(e: MouseEvent) {
    function onMouseMove(e: MouseEvent) {
      rotatorRef.current!.mouseMove(e);
      redraw();
    }
    function onMouseUp(e: MouseEvent) {
      rotatorRef.current!.mouseUp(e);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    rotatorRef.current!.mouseDown(e);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function onMouseDown1(_: MouseEvent) {
    function onMouseMove(e: MouseEvent) {
      rotateCamera(e);
      redraw();
    }
    function onMouseUp(e: MouseEvent) {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function rotateCamera(e: MouseEvent) {
    const step = 0.001;
    camera.rotateY(step * e.movementX);
    camera.rotateX(step * e.movementY);
  }

  function redraw() {
    if (!canvasRef.current) return;
    calcUniforms();
    canvasRef.current.redraw();
  }

  return (
    <>
      <Canvas
        ref={canvasRef}
        className={className}
        shaders={shader}
        arrays={arrays}
        uniformsRef={uniforms}
        onResized={onResized}
        css={css`
          border: 1px solid black;
        `}
      />
    </>
  );
}
