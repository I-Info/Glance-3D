import { Geometry } from '../Geometry';
import { Material } from '../materials/Material';
import { MeshPhongMaterial } from '../materials/MeshPhongMaterial';
import { Object3D } from '../Object';

export class Mesh extends Object3D {
    constructor(
        geometry: Geometry = new Geometry(),
        material: Material | Material[] = new MeshPhongMaterial()
    ) {
        super();
        this.geometry = geometry;
        this.material = material;
    }
}
