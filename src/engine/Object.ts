import { mat4 } from 'gl-matrix';
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
}
