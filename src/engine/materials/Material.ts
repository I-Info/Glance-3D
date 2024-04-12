import { Color } from '../Color';

export class Material {
    name: string = '';
    flatShading: boolean = false;
    vertexColors: boolean = false;
    color: Color = new Color(0xffffff);
    map: any = null;
    [key: string]: any;

    constructor() {}

    copy(source: Material) {
        this.name = source.name;
        this.flatShading = source.flatShading;
        this.vertexColors = source.vertexColors;
        this.map = source.map;
        return this;
    }

    setValues(values: { [key: string]: any }) {
        if (values === undefined) return;

        for (const key in values) {
            const newValue = values[key];

            if (newValue === undefined) {
                console.warn(
                    `Material: parameter '${key}' has value of undefined.`
                );
                continue;
            }

            const currentValue = this[key];

            if (currentValue === undefined) {
                console.warn(
                    `Material: '${key}' is not a property of THREE.${this.type}.`
                );
                continue;
            }

            if (currentValue && currentValue instanceof Color) {
                currentValue.set(newValue);
            } else if (
                currentValue &&
                Array.isArray(currentValue) &&
                newValue &&
                Array.isArray(newValue)
            ) {
                currentValue[0] = newValue[0];
                currentValue[1] = newValue[1];
                currentValue[2] = newValue[2];
            } else {
                this[key] = newValue;
            }
        }
    }
}
