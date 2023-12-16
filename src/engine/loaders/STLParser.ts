import { ObjectParser } from './ObjectParser';
import { Geometry } from '../Geometry';

export default class STLParser implements ObjectParser {
  parse(data: any) {}

  private parseBinary(data: ArrayBuffer) {
    const reader = new DataView(data);
    const faces = reader.getUint32(80, true);

    let r,
      g,
      b,
      hasColors = false,
      colors = [];
    let defaultR, defaultG, defaultB, alpha;

    // process STL header
    // check for default color in header ("COLOR=rgba" sequence).

    for (let index = 0; index < 80 - 10; index++) {
      if (
        reader.getUint32(index, false) == 0x434f4c4f /*COLO*/ &&
        reader.getUint8(index + 4) == 0x52 /*'R'*/ &&
        reader.getUint8(index + 5) == 0x3d /*'='*/
      ) {
        hasColors = true;
        colors = Array(faces * 3 * 3);

        defaultR = reader.getUint8(index + 6) / 255;
        defaultG = reader.getUint8(index + 7) / 255;
        defaultB = reader.getUint8(index + 8) / 255;
        alpha = reader.getUint8(index + 9) / 255;
      }
    }

    const dataOffset = 84;
    const faceLength = 12 * 4 + 2;

    const geometry = new Geometry();

    const vertices = Array<number>(faces * 3 * 3);
    const normals = Array<number>(faces * 3 * 3);

    for (let face = 0; face < faces; face++) {
      const start = dataOffset + face * faceLength;
      const normalX = reader.getFloat32(start, true);
      const normalY = reader.getFloat32(start + 4, true);
      const normalZ = reader.getFloat32(start + 8, true);

      if (hasColors) {
        const packedColor = reader.getUint16(start + 48, true);

        if ((packedColor & 0x8000) === 0) {
          // facet has its own unique color

          r = (packedColor & 0x1f) / 31;
          g = ((packedColor >> 5) & 0x1f) / 31;
          b = ((packedColor >> 10) & 0x1f) / 31;
        } else {
          r = defaultR;
          g = defaultG;
          b = defaultB;
        }
      }

      for (let i = 1; i <= 3; i++) {
        const vertexstart = start + i * 12;
        const componentIdx = face * 3 * 3 + (i - 1) * 3;

        vertices[componentIdx] = reader.getFloat32(vertexstart, true);
        vertices[componentIdx + 1] = reader.getFloat32(vertexstart + 4, true);
        vertices[componentIdx + 2] = reader.getFloat32(vertexstart + 8, true);

        normals[componentIdx] = normalX;
        normals[componentIdx + 1] = normalY;
        normals[componentIdx + 2] = normalZ;

        if (hasColors) {
          colors[componentIdx] = this.sRGBToLinear(r!);
          colors[componentIdx + 1] = this.sRGBToLinear(g!);
          colors[componentIdx + 2] = this.sRGBToLinear(b!);
        }
      }
    }

    geometry.setPositions(vertices, 3);
    geometry.setNormals(normals, 3);

    if (hasColors) {
      geometry.setColors(colors, 3);
      geometry.alpha = alpha;
    }

    return geometry;
  }

  private parseASCII(data: string): Geometry {
    const geometry = new Geometry();

    const patternSolid = /solid([\s\S]*?)endsolid/g;
    const patternFace = /facet([\s\S]*?)endfacet/g;
    const patternName = /solid\s(.+)/;
    let faceCounter = 0;

    const patternFloat = /[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/
      .source;
    const patternVertex = new RegExp(
      'vertex' + patternFloat + patternFloat + patternFloat,
      'g'
    );
    const patternNormal = new RegExp(
      'normal' + patternFloat + patternFloat + patternFloat,
      'g'
    );

    const vertices: number[] = [];
    const normals: number[] = [];

    const normal = Array<number>(3);

    let result;

    let groupCount = 0;
    let startVertex = 0;
    let endVertex = 0;

    while ((result = patternSolid.exec(data)) !== null) {
      startVertex = endVertex;

      const solid = result[0];

      const name = (result = patternName.exec(solid)) !== null ? result[1] : '';

      while ((result = patternFace.exec(solid)) !== null) {
        let vertexCountPerFace = 0;
        let normalCountPerFace = 0;

        const text = result[0];

        while ((result = patternNormal.exec(text)) !== null) {
          normal[0] = parseFloat(result[1]);
          normal[1] = parseFloat(result[2]);
          normal[2] = parseFloat(result[3]);
          normalCountPerFace++;
        }

        while ((result = patternVertex.exec(text)) !== null) {
          vertices.push(
            parseFloat(result[1]),
            parseFloat(result[2]),
            parseFloat(result[3])
          );
          normals.push(normal[0], normal[1], normal[2]);
          vertexCountPerFace++;
          endVertex++;
        }

        // every face have to own ONE valid normal

        if (normalCountPerFace !== 1) {
          console.error(
            "STLParser: Something isn't right with the normal of face number " +
              faceCounter
          );
        }

        // each face have to own THREE valid vertices

        if (vertexCountPerFace !== 3) {
          console.error(
            "STLParser: Something isn't right with the vertices of face number " +
              faceCounter
          );
        }

        faceCounter++;
      }

      const start = startVertex;
      const count = endVertex - startVertex;

      geometry.addGroup(start, count, name);
      groupCount++;
    }

    geometry.setPositions(vertices);
    geometry.setNormals(normals);

    return geometry;
  }

  private sRGBToLinear(c: number) {
    return c < 0.04045
      ? c * 0.0773993808
      : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
  }
}
