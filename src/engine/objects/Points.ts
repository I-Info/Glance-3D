import { Geometry } from '../Geometry';
import { Material } from '../materials/Material';
import { PointsMaterial } from '../materials/PointsMaterial';
import { Object3D } from '../Object';

export class Points extends Object3D {
  constructor(
    geometry: Geometry = new Geometry(),
    material: Material | Material[] = new PointsMaterial()
  ) {
    super();
    this.geometry = geometry;
    this.material = material;
  }
}
