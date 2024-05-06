export class Color {
  r!: number;
  g!: number;
  b!: number;

  constructor(r: number | Color | number[], g?: number, b?: number) {
    return this.set(r, g, b);
  }

  set(r: number | Color | number[], g?: number, b?: number) {
    if (Array.isArray(r)) {
      return this.setArray(r);
    }
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

  setArray(array: number[] | [number, number, number]) {
    this.r = array[0];
    this.g = array[1];
    this.b = array[2];

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

  convertSRGBToLinear() {
    this.copySRGBToLinear(this);

    return this;
  }

  convertLinearToSRGB() {
    this.copyLinearToSRGB(this);

    return this;
  }

  copySRGBToLinear(color: Color) {
    this.r = SRGBToLinear(color.r);
    this.g = SRGBToLinear(color.g);
    this.b = SRGBToLinear(color.b);

    return this;
  }

  copyLinearToSRGB(color: Color) {
    this.r = LinearToSRGB(color.r);
    this.g = LinearToSRGB(color.g);
    this.b = LinearToSRGB(color.b);

    return this;
  }
}

export function SRGBToLinear(c: number): number {
  return c < 0.04045
    ? c * 0.0773993808
    : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
}

export function LinearToSRGB(c: number): number {
  return c < 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 0.41666) - 0.055;
}
