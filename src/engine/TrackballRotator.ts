import { mat4, vec3 } from 'gl-matrix';
import Quaternion from 'quaternion';

declare type Point = [number, number, number];

export class TrackballRotator {
  last: Quaternion;
  current: Quaternion;
  private start: { x: number; y: number } | null = null;
  radius: number = 1;
  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.last = Quaternion.ONE;
    this.current = Quaternion.ONE;
    this.canvas = canvas;
  }

  mouseDown(evt: MouseEvent) {
    this.start = { x: evt.offsetX, y: evt.offsetY };
  }

  private offset(evt: MouseEvent): [number, number] {
    const rect = this.canvas.getBoundingClientRect();
    return [
      Math.trunc(evt.clientX - rect.left),
      Math.trunc(evt.clientY - rect.top),
    ];
  }

  private get size() {
    const rect = this.canvas.getBoundingClientRect();
    return [Math.trunc(rect.width), Math.trunc(rect.height)];
  }

  mouseMove(evt: MouseEvent, transform?: mat4): boolean {
    if (!this.start) return false;
    const start = this.project(this.start.x, this.start.y);
    const [x, y] = this.offset(evt);
    const end = this.project(x, y);
    if (transform) {
      // Transform to camera space
      vec3.transformMat4(start, start, transform);
      vec3.transformMat4(end, end, transform);
    }
    this.current = Quaternion.fromBetweenVectors(start, end);
    return true;
  }

  mouseUp(evt: MouseEvent, transform?: mat4) {
    if (!this.mouseMove(evt, transform)) return false;
    this.last = this.current.mul(this.last);
    this.current = Quaternion.ONE;
    this.start = null;
  }

  get matrix(): mat4 {
    const result: mat4 = this.current.mul(this.last).toMatrix4(false);
    return mat4.transpose(result, result);
  }

  private project(x: number, y: number): Point {
    const r2 = Math.pow(this.radius, 2);
    const [w, h] = this.size;
    const s = Math.min(w, h) - 1;

    // map to -1 to 1
    x = (2 * x - w - 1) / s;
    y = (2 * y - h - 1) / s;
    const x2 = Math.pow(x, 2);
    const y2 = Math.pow(y, 2);
    const a = x2 + y2;

    let z: number;
    const div = r2 / 2;
    if (a <= div)
      z = Math.sqrt(r2 - a); // Sphere
    else z = div / Math.sqrt(a); // Hyperbola

    return [x, -y, z];
  }
}
