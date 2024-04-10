import { Color } from '../Color';

export class Material {
    flatShading: boolean = false;
    vertexColors: boolean = false;
    color: Color = new Color(0xffffff);
    map: any = null;

    constructor() {}

    copy(source: Material) {
        this.flatShading = source.flatShading;
        this.vertexColors = source.vertexColors;
        this.map = source.map;
        return this;
    }
}
