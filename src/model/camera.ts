import { mat4, vec3 } from 'gl-matrix';

export class Camera {
  public position: vec3;
  public rotation: mat4;
  public up: vec3;
  public fov: number;
  public aspect: number;
  public near: number;
  public far: number;

  constructor(near?: number, far?: number, fov?: number, aspect?: number) {
    this.position = vec3.fromValues(0, 0, 0);
    this.rotation = mat4.create();
    this.up = vec3.fromValues(0, 1, 0);
    this.fov = fov ? fov : Math.PI / 4;
    this.aspect = aspect ? aspect : 1;
    this.near = near ? near : 1;
    this.far = far ? far : 1000;
  }

  getPerspectiveMatrix(): mat4 {
    const projection = mat4.create();
    mat4.perspective(projection, this.fov, this.aspect, this.near, this.far);
    return projection;
  }

  lookAt(target: vec3) {
    mat4.targetTo(this.rotation, this.position, target, this.up);
    this.rotation[12] = 0;
    this.rotation[13] = 0;
    this.rotation[14] = 0;
  }

  move(direction: vec3, distance: number) {
    vec3.normalize(direction, direction);
    vec3.scaleAndAdd(this.position, this.position, direction, distance);
  }

  moveForward(distance: number) {
    const forward = vec3.fromValues(0, 0, -1);
    vec3.transformMat4(forward, forward, this.rotation);
    this.move(forward, distance);
  }

  moveBackward(distance: number) {
    this.moveForward(-distance);
  }

  moveRight(distance: number) {
    const right = vec3.fromValues(1, 0, 0);
    vec3.transformMat4(right, right, this.rotation);
    this.move(right, distance);
  }

  moveLeft(distance: number) {
    this.moveRight(-distance);
  }

  moveUp(distance: number) {
    const up = vec3.clone(this.up);
    // vec3.transformMat4(up, up, this.rotation);
    this.move(up, distance);
  }

  moveDown(distance: number) {
    this.moveUp(-distance);
  }

  rotateX(angle: number) {
    mat4.rotateX(this.rotation, this.rotation, angle);
  }

  rotateY(angle: number) {
    mat4.rotateY(this.rotation, this.rotation, angle);
  }

  getViewMatrix() {
    const view = mat4.create();
    mat4.translate(view, view, this.position);
    mat4.multiply(view, view, this.rotation);
    return mat4.invert(view, view);
  }
}
