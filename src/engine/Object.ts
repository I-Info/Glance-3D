import { mat4, vec3 } from 'gl-matrix';
import { Geometry } from './Geometry';
import { Material } from './materials/Material';

export class Object3D {
  name?: string;
  geometry?: Geometry;
  material?: Material | Material[];
  matrix: mat4;
  children: Object3D[] = [];
  parent?: Object3D;

  constructor() {
    this.matrix = mat4.create();
  }

  add(child: Object3D) {
    this.children.push(child);
    child.parent = this;
  }

  remove(child: Object3D) {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
    child.parent = undefined;
  }

  get boundingBox(): { min: vec3; max: vec3 } | undefined {
    const curr = this.geometry?.boundingBox;
    if (this.children.length == 0)
      return curr
        ? { min: vec3.clone(curr.min), max: vec3.clone(curr.max) }
        : curr;
    let some = false;
    const min: vec3 = [Infinity, Infinity, Infinity];
    const max: vec3 = [-Infinity, -Infinity, -Infinity];
    if (curr) {
      vec3.copy(min, curr.min);
      vec3.copy(max, curr.max);
      some = true;
    }
    for (const child of this.children) {
      const box = child.boundingBox;
      if (!box) continue;
      min[0] = Math.min(min[0], box.min[0]);
      min[1] = Math.min(min[1], box.min[1]);
      min[2] = Math.min(min[2], box.min[2]);
      max[0] = Math.max(max[0], box.max[0]);
      max[1] = Math.max(max[1], box.max[1]);
      max[2] = Math.max(max[2], box.max[2]);
      some = true;
    }
    if (some) return { min, max };
    else return undefined;
  }
}
