import { Canvas, CanvasRef, CanvasObjects } from '@/components/Canvas';
import Camera from '@/engine/Camera';
import shaderSimple from '@/shaders/simple';
import shaderPhong from '@/shaders/phong';
import shaderGouraud from '@/shaders/gouraud';
import shaderBlinnPhong from '@/shaders/blinn-phong';
import React from 'react';
import { mat4, vec3, vec4 } from 'gl-matrix';
import { TrackballRotator } from '@/engine/TrackballRotator';
import { Object3D } from '@/engine/Object';
import { Mesh } from '@/engine/objects/Mesh';

const origin: vec3 = [0, 0, 0];

const lightDirection: vec3 = [1, 1, 1];
vec3.normalize(lightDirection, lightDirection);

const lightPosition: vec3 = [5, 5, 5];
const globalAmbient: vec4 = [0.7, 0.7, 0.7, 1];
const lightAmbient: vec4 = [0.2, 0.2, 0.2, 1];
const lightDiffuse: vec4 = [1, 1, 1, 1];
const lightSpecular: vec4 = [1, 1, 1, 1];

const materialAmbient: vec4 = [0.2, 0.2, 0.2, 1];
const materialDiffuse: vec4 = [0.7, 0.7, 0.7, 1];
const materialSpecular: vec4 = [0.8, 0.8, 0.8, 1];
const materialShininess = 500;

type Light = {
  ambient: vec4;
  diffuse: vec4;
  specular: vec4;
  position: vec3;
};
type Material = {
  ambient: vec4;
  diffuse: vec4;
  specular: vec4;
  shininess: number;
};

export type Shader = 'simple' | 'phong' | 'gouraud' | 'blinn-phong';

function shaderSelect(shader: Shader) {
  switch (shader) {
    case 'simple':
      return shaderSimple;
    case 'phong':
      return shaderPhong;
    case 'gouraud':
      return shaderGouraud;
    case 'blinn-phong':
      return shaderBlinnPhong;
  }
}

export function Scene({ obj, shader }: { obj: Object3D; shader: Shader }) {
  const canvasRef = React.useRef<CanvasRef>(null);
  const rotatorRef = React.useRef<TrackballRotator | null>(null);
  const cameraRef = React.useRef<Camera>(new Camera());
  const objectList = React.useRef<CanvasObjects>([]);
  const center = React.useRef<vec3 | null>(null);
  const radius = React.useRef(0);
  const translate = React.useRef(mat4.create());

  React.useEffect(() => {
    console.log('Scene useEffect');
    objectList.current = [];
    center.current = null;
    radius.current = 0;
    translate.current = mat4.create();

    function addObject(obj: Object3D) {
      if (obj instanceof Mesh) {
        const geometry = obj.geometry;
        const arrays = geometry.getArrays('a_position', 'a_normal');
        objectList.current.push({ arrays: arrays, uniforms: {} });
      }
      if (obj.children.length !== 0) {
        for (const child of obj.children) {
          addObject(child);
        }
      }
    }

    addObject(obj);
    const bbox = obj.boundingBox;
    if (bbox) {
      center.current = vec3.lerp(vec3.create(), bbox.min, bbox.max, 0.5);
      radius.current = vec3.distance(bbox.min, bbox.max) * 1.2;
    }

    canvasRef.current!.setObjects(objectList.current);

    if (!center.current) center.current = [0, 0, 0];

    mat4.translate(
      translate.current,
      translate.current,
      vec3.negate(vec3.create(), center.current)
    );

    const camera = cameraRef.current;
    camera.rotation = mat4.create();
    camera.position = [0, 0, radius.current];
    camera.near = radius.current / 100;
    camera.far = radius.current * 10;

    const canvas = canvasRef.current!.this;
    rotatorRef.current = new TrackballRotator(canvas);
    document.addEventListener('keydown', onKeydown);
    canvas.addEventListener('wheel', onWheel);
    canvas.addEventListener('mousedown', onMouseDown);

    redraw();

    return () => {
      rotatorRef.current = null;
      document.removeEventListener('keydown', onKeydown);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('mousedown', onMouseDown);
    };
  }, [obj, shader]);

  const camera = cameraRef.current;

  function installLights(view: mat4): { light: Light; material: Material } {
    const lightPositionView = vec3.transformMat4(
      vec3.create(),
      lightPosition,
      view
    );
    const light = {
      ambient: lightAmbient,
      diffuse: lightDiffuse,
      specular: lightSpecular,
      position: lightPositionView,
    };
    const material = {
      ambient: materialAmbient,
      diffuse: materialDiffuse,
      specular: materialSpecular,
      shininess: materialShininess,
    };
    return { light, material };
  }

  function calcPhongUniforms() {
    const model = mat4.clone(translate.current);
    const rotate = rotatorRef.current!.matrix;
    mat4.multiply(model, rotate, model);

    const view = camera.getViewMatrix();
    const projection = camera.getPerspectiveMatrix();

    const modelView = mat4.create();
    mat4.multiply(modelView, view, model);

    const normal = mat4.create();
    mat4.invert(normal, model);
    mat4.transpose(normal, normal);

    const { light, material } = installLights(view);

    for (const obj of objectList.current) {
      obj.uniforms.u_globalAmbient = globalAmbient;
      obj.uniforms.u_light = light;
      obj.uniforms.u_material = material;
      obj.uniforms.u_mv = modelView;
      obj.uniforms.u_proj = projection;
      obj.uniforms.u_norm = normal;
    }
  }

  function calcSimpleUniforms() {
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

    for (const obj of objectList.current) {
      obj.uniforms.u_modelInverseTranspose = modelInverseTranspose;
      obj.uniforms.u_projection = modelViewProjection;
      obj.uniforms.u_lightDirection = lightDirection;
      obj.uniforms.u_color = [1, 1, 1, 1];
    }
  }

  function calcUniforms() {
    if (shader === 'simple') {
      calcSimpleUniforms();
    } else {
      calcPhongUniforms();
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
      <Canvas
        ref={canvasRef}
        shaders={shaderSelect(shader)}
        onResized={onResized}
      />
    </>
  );
}
