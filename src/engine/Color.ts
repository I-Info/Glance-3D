export class Color {
    r!: number;
    g!: number;
    b!: number;

    constructor(r: number | Color, g?: number, b?: number) {
        return this.set(r, g, b);
    }

    set(r: number | Color, g?: number, b?: number) {
        if (g === undefined && b === undefined) {
            // r is Color, hex or string

            const value = r;

            if (value instanceof Color) {
                this.copy(value);
            } else if (typeof value === 'number') {
                this.setHex(value);
            }
        } else {
            this.setRGB(r as number, g!, b!);
        }

        return this;
    }

    setRGB(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;

        return this;
    }

    setHex(hex: number) {
        hex = Math.floor(hex);

        this.r = ((hex >> 16) & 255) / 255;
        this.g = ((hex >> 8) & 255) / 255;
        this.b = (hex & 255) / 255;

        return this;
    }

    copy(color: Color) {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;

        return this;
    }
}
