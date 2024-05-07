import { Canvas, CanvasRef, CanvasObjects } from '@/components/Canvas';
import Camera from '@/engine/Camera';
import shader from '@/shaders/main';
import React from 'react';
import { mat4, vec3 } from 'gl-matrix';
import { TrackballRotator } from '@/engine/TrackballRotator';
import { Object3D } from '@/engine/Object';
import { Mesh } from '@/engine/objects/Mesh';
import { Group } from '@/engine/objects/Group';

const origin: vec3 = [0, 0, 0];

export default function Scene({ obj }: { obj: Object3D }) {
  const canvasRef = React.useRef<CanvasRef>(null);
  const rotatorRef = React.useRef<TrackballRotator | null>(null);

  const cameraRef = React.useRef<Camera>(new Camera());
  const camera = cameraRef.current;
  const objectList = React.useRef<CanvasObjects>([]);
  const center = React.useRef<vec3 | null>(null);
  const radius = React.useRef(0);
  const translate = React.useRef(mat4.create());

  React.useEffect(() => {
    objectList.current = [];
    center.current = null;
    radius.current = 0;
    translate.current = mat4.create();

    function addObject(obj: Object3D) {
      if (obj instanceof Mesh) {
        const geometry = obj.geometry;
        const arrays = geometry.getArrays('a_position', 'a_normal');
        geometry.prepExtends();
        if (center.current === null) {
          center.current = vec3.clone(geometry.center);
        } else {
          vec3.add(center.current, center.current, geometry.center);
        }
        if (geometry.radius > radius.current) radius.current = geometry.radius;
        objectList.current.push({ arrays: arrays, uniforms: {} });
      }
    }

    if (obj instanceof Group) {
      for (const child of obj.children) {
        addObject(child);
      }
    } else {
      addObject(obj);
    }

    canvasRef.current!.setObjects(objectList.current);

    if (!center.current) center.current = [0, 0, 0];

    mat4.translate(
      translate.current,
      translate.current,
      vec3.negate(vec3.create(), center.current)
    );

    camera.position = [0, 0, radius.current];
    camera.near = radius.current / 100;
    camera.far = radius.current * 10;

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
  }, [obj]); // TODO

  function calcUniforms() {
    const model = mat4.clone(translate.current);
    const rotate = rotatorRef.current!.matrix;
    mat4.multiply(model, rotate, model);

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

    for (const obj of objectList.current) {
      obj.uniforms.u_modelInverseTranspose = modelInverseTranspose;
      obj.uniforms.u_projection = modelViewProjection;
      obj.uniforms.u_lightDirection = lightDirection;
      obj.uniforms.u_color = [1, 1, 1, 1];
    }
  }

  function onResized({ width, height }: { width: number; height: number }) {
    camera.aspect = width / height;
    calcUniforms();
  }

  function onKeydown(e: KeyboardEvent) {
    const step = 0.1;
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
        camera.lookAt(origin);
        break;
      case 'r':
        camera.position = [0, 0, radius.current];
        camera.lookAt(origin);
        break;
    }
    redraw();
  }

  function onWheel(e: WheelEvent) {
    const step = 0.01;
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
      rotatorRef.current!.mouseMove(e, camera.rotation);
      redraw();
    }
    function onMouseUp(e: MouseEvent) {
      rotatorRef.current!.mouseUp(e, camera.rotation);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    camera.lookAt(origin);
    rotatorRef.current!.mouseDown(e);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    redraw();
  }

  function onMouseDown1(_: MouseEvent) {
    function onMouseMove(e: MouseEvent) {
      rotateCamera(e);
      redraw();
    }
    function onMouseUp(_: MouseEvent) {
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
      <Canvas ref={canvasRef} shaders={shader} onResized={onResized} />
    </>
  );
}
