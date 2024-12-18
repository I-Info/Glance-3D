import { SRGBToLinear } from '../Color';
import { Geometry } from '../Geometry';
import { vec3 } from 'gl-matrix';

/**
 * Reference: https://github.com/mrdoob/three.js/blob/dev/examples/jsm/loaders/STLLoader.js
 * License: MIT
 */
export class STLLoader {
  parse(data: any): Geometry {
    const binData = this.ensureBinary(data);

    return this.isBinary(binData)
      ? this.parseBinary(binData)
      : this.parseASCII(this.ensureString(data));
  }

  private isBinary(data: ArrayBuffer) {
    const reader = new DataView(data);
    const face_size = (32 / 8) * 3 + (32 / 8) * 3 * 3 + 16 / 8;
    const n_faces = reader.getUint32(80, true);
    const expect = 80 + 32 / 8 + n_faces * face_size;

    if (expect === reader.byteLength) {
      return true;
    }

    // An ASCII STL data must begin with 'solid ' as the first six bytes.
    // However, ASCII STLs lacking the SPACE after the 'd' are known to be
    // plentiful.  So, check the first 5 bytes for 'solid'.

    // Several encodings, such as UTF-8, precede the text with up to 5 bytes:
    // https://en.wikipedia.org/wiki/Byte_order_mark#Byte_order_marks_by_encoding
    // Search for "solid" to start anywhere after those prefixes.

    // US-ASCII ordinal values for 's', 'o', 'l', 'i', 'd'

    const solid: Array<number> = [115, 111, 108, 105, 100];

    for (let off = 0; off < 5; off++) {
      // If "solid" text is matched to the current offset, declare it to be an ASCII STL.

      if (this.matchDataViewAt(solid, reader, off)) return false;
    }

    // Couldn't find "solid" text at the beginning; it is binary STL.
    return true;
  }

  private matchDataViewAt(
    query: Array<number>,
    reader: DataView,
    offset: number
  ) {
    // Check if each byte in query matches the corresponding byte from the current offset

    for (let i = 0, il = query.length; i < il; i++) {
      if (query[i] !== reader.getUint8(offset + i)) return false;
    }

    return true;
  }

  private ensureString(buffer: any): string {
    if (typeof buffer !== 'string') {
      return new TextDecoder().decode(buffer);
    }

    return buffer;
  }

  private ensureBinary(buffer: any): ArrayBuffer {
    if (typeof buffer === 'string') {
      const array_buffer = new Uint8Array(buffer.length);
      for (let i = 0; i < buffer.length; i++) {
        array_buffer[i] = buffer.charCodeAt(i) & 0xff; // implicitly assumes little-endian
      }

      return array_buffer.buffer || array_buffer;
    } else {
      return buffer;
    }
  }

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

    const min: vec3 = [Infinity, Infinity, Infinity];
    const max: vec3 = [-Infinity, -Infinity, -Infinity];

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

        for (let component = 0; component < 3; component++) {
          if (vertices[componentIdx + component] < min[component]) {
            min[component] = vertices[componentIdx + component];
          }

          if (vertices[componentIdx + component] > max[component]) {
            max[component] = vertices[componentIdx + component];
          }
        }

        normals[componentIdx] = normalX;
        normals[componentIdx + 1] = normalY;
        normals[componentIdx + 2] = normalZ;

        if (hasColors) {
          colors[componentIdx] = SRGBToLinear(r!);
          colors[componentIdx + 1] = SRGBToLinear(g!);
          colors[componentIdx + 2] = SRGBToLinear(b!);
        }
      }
    }

    geometry.setPositions(vertices, 3);
    geometry.setNormals(normals, 3);
    geometry.setExtends(min, max);

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
    const min: vec3 = [Infinity, Infinity, Infinity];
    const max: vec3 = [-Infinity, -Infinity, -Infinity];

    function addVertex(vertex: number[]) {
      vertices.push(vertex[0], vertex[1], vertex[2]);

      for (let i = 0; i < 3; i++) {
        if (vertex[i] < min[i]) {
          min[i] = vertex[i];
        }

        if (vertex[i] > max[i]) {
          max[i] = vertex[i];
        }
      }
    }

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
          addVertex([
            parseFloat(result[1]),
            parseFloat(result[2]),
            parseFloat(result[3]),
          ]);
          normals.push(normal[0], normal[1], normal[2]);
          vertexCountPerFace++;
          endVertex++;
        }

        // every face have to own ONE valid normal

        if (normalCountPerFace !== 1) {
          throw new Error(
            "STLParser: Something isn't right with the normal of face number " +
              faceCounter
          );
        }

        // each face have to own THREE valid vertices

        if (vertexCountPerFace !== 3) {
          throw new Error(
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
    geometry.setExtends(min, max);

    return geometry;
  }
}
