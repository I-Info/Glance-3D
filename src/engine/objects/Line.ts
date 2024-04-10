import { Geometry } from '../Geometry';
import { LineMaterial } from '../materials/LineMaterial';
import { Material } from '../materials/Material';
import { Object3D } from '../Object';

export class Line extends Object3D {
    constructor(
        geometry: Geometry = new Geometry(),
        material: Material | Material[] = new LineMaterial()
    ) {
        super();
        this.geometry = geometry;
        this.material = material;
    }
}
