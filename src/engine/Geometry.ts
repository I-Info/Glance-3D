import twgl from '@/libs/twgl';
import { GL_FLOAT } from '@/libs/webgl-const';
import { vec3 } from 'gl-matrix';

type _Array = {
  data: number[];
  numComponents: number;
  type: number;
};

export class Geometry {
  groups: Group[] = [];
  positions!: twgl.ArraySpec;
  normals!: twgl.ArraySpec;
  extends?: { min: vec3; max: vec3 };
  colors?: twgl.ArraySpec;
  uvs?: twgl.ArraySpec;
  alpha?: number;

  addGroup(start: number, end: number, key: any) {
    this.groups.push({ key, start, end });
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

  setUVs(uvs: number[], num: number = 2, type: number = GL_FLOAT) {
    this.uvs = { data: uvs, numComponents: num, type: type };
  }

  setExtends(min: vec3, max: vec3) {
    this.extends = { min, max };
  }

  prepExtends() {
    if (!this.positions) throw new Error('Positions not found');
    if (this.extends) return;
    const positions = (this.positions as _Array).data;
    const min: vec3 = [Infinity, Infinity, Infinity];
    const max: vec3 = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < positions.length; i += 3) {
      min[0] = Math.min(min[0], positions[i]);
      min[1] = Math.min(min[1], positions[i + 1]);
      min[2] = Math.min(min[2], positions[i + 2]);
      max[0] = Math.max(max[0], positions[i]);
      max[1] = Math.max(max[1], positions[i + 1]);
      max[2] = Math.max(max[2], positions[i + 2]);
    }
    this.extends = { min, max };
  }

  get center(): vec3 {
    if (!this.extends) throw new Error('Extends not found');
    const { min, max } = this.extends;
    return [
      (min[0] + max[0]) / 2,
      (min[1] + max[1]) / 2,
      (min[2] + max[2]) / 2,
    ];
  }

  get range(): vec3 {
    if (!this.extends) throw new Error('Extends not found');
    const { min, max } = this.extends;
    return [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  }

  get radius(): number {
    if (!this.extends) throw new Error('Extends not found');
    const range = this.range;
    return vec3.length(range) * 1.2;
  }

  get boundingBox(): { min: vec3; max: vec3 } {
    if (!this.extends) throw new Error('Extends not found');
    return this.extends;
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
  key: any;
  start: number;
  end: number;
};
