import { Material } from './Material';

export class MeshPhongMaterial extends Material {
    constructor(param?: any) {
        super();

        this.setValues(param);
    }
}
