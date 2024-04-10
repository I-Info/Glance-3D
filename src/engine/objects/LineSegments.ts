import { Geometry } from '../Geometry';
import { Material } from '../materials/Material';
import { Line } from './Line';

export class LineSegments extends Line {
    constructor(geometry: Geometry, material: Material | Material[]) {
        super(geometry, material);
    }
}
