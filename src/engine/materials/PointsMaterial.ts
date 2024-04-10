import { Material } from './Material';

export class PointsMaterial extends Material {
    size: number;
    sizeAttenuation: boolean;

    constructor(size: number = 1, sizeAttenuation: boolean = false) {
        super();
        this.size = size;
        this.sizeAttenuation = sizeAttenuation;
    }
}
