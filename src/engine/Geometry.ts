import twgl from '@/libs/twgl';

export class Geometry {
  groups: Group[] = [];
  positions?: twgl.ArraySpec;
  normals?: twgl.ArraySpec;
  colors?: twgl.ArraySpec;
  alpha?: number;

  addGroup(start: number, end: number, name?: string) {
    this.groups.push({ name, start, end });
  }

  setPositions(positions: number[], stride: number = 3) {
    this.positions = { data: positions, numComponents: stride };
  }

  setNormals(normals: number[], stride: number = 3) {
    this.normals = { data: normals, numComponents: stride };
  }

  setColors(colors: number[], stride: number = 3) {
    this.colors = { data: colors, numComponents: stride };
  }
}

export type Group = {
  name: string | undefined;
  start: number;
  end: number;
};
