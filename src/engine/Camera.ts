import { mat4, vec3 } from 'gl-matrix';

export class Camera {
  public position: vec3;
  public rotation: mat4;
  public up: vec3;
  public fov: number;
  public aspect: number;
  public near: number;
  public far: number;

  constructor(
    fov: number = 50,
    aspect: number = 1,
    near: number = 0.1,
    far: number = 2000
  ) {
    this.position = vec3.fromValues(0, 0, 0);
    this.rotation = mat4.create();
    this.up = vec3.fromValues(0, 1, 0);
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
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
    this.move(up, distance);
  }

  moveDown(distance: number) {
    this.moveUp(-distance);
  }

  rotateX(angle: number) {
    const axisX = vec3.fromValues(1, 0, 0);
    const axisZ = this.getAxisZ();
    vec3.transformMat4(axisX, axisX, this.rotation);
    const rotation = mat4.create();
    mat4.rotate(rotation, rotation, angle, axisX);
    vec3.transformMat4(axisZ, axisZ, rotation);
    const axisY = vec3.cross(vec3.create(), axisZ, axisX);
    vec3.normalize(axisY, axisY);
    this.updateAxises(axisX, axisY, axisZ);
  }

  rotateY(angle: number) {
    const axisZ = this.getAxisZ();
    const rotation = mat4.create();
    mat4.rotate(rotation, rotation, angle, this.up);
    vec3.transformMat4(axisZ, axisZ, rotation);
    const axisX = vec3.cross(vec3.create(), this.up, axisZ);
    vec3.normalize(axisX, axisX);
    const axisY = vec3.cross(vec3.create(), axisZ, axisX);
    vec3.normalize(axisY, axisY);
    this.updateAxises(axisX, axisY, axisZ);
  }

  getAxisZ(): vec3 {
    return vec3.fromValues(
      this.rotation[8],
      this.rotation[9],
      this.rotation[10]
    );
  }

  private updateAxises(axisX: vec3, axisY: vec3, axisZ: vec3) {
    this.rotation[0] = axisX[0];
    this.rotation[1] = axisX[1];
    this.rotation[2] = axisX[2];
    this.rotation[4] = axisY[0];
    this.rotation[5] = axisY[1];
    this.rotation[6] = axisY[2];
    this.rotation[8] = axisZ[0];
    this.rotation[9] = axisZ[1];
    this.rotation[10] = axisZ[2];
  }

  getViewMatrix() {
    const view = mat4.create();
    mat4.translate(view, view, this.position);
    mat4.multiply(view, view, this.rotation);
    return mat4.invert(view, view);
  }
}
