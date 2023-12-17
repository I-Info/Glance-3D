import twgl from '@/libs/twgl';
import { GL_FLOAT } from '@/libs/webgl-const';

export default class Geometry {
  groups: Group[] = [];
  positions?: twgl.ArraySpec;
  normals?: twgl.ArraySpec;
  colors?: twgl.ArraySpec;
  alpha?: number;

  addGroup(start: number, end: number, name?: string) {
    this.groups.push({ name, start, end });
  }

  setPositions(positions: number[], num: number = 3, type = GL_FLOAT) {
    this.positions = { data: positions, numComponents: num, type: type };
  }

  setNormals(normals: number[], num: number = 3, type = GL_FLOAT) {
    this.normals = { data: normals, numComponents: num, type: type };
  }

  setColors(colors: number[], num: number = 3, type: number = GL_FLOAT) {
    this.colors = { data: colors, numComponents: num, type: type };
  }

  getArrays(
    aPosition?: string,
    aNormal?: string,
    aColor?: string
  ): twgl.Arrays {
    const arrays: twgl.Arrays = {};

    if (aPosition) {
      if (this.positions) arrays[aPosition] = this.positions;
      else throw new Error('Positions not found');
    }

    if (aNormal) {
      if (this.normals) arrays[aNormal] = this.normals;
      else throw new Error('Normals not found');
    }

    if (aColor) {
      if (this.colors) arrays[aColor] = this.colors;
      else throw new Error('Colors not found');
    }

    return arrays;
  }
}

type Group = {
  name: string | undefined;
  start: number;
  end: number;
};
