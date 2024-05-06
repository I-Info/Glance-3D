/**
 * Loads a Wavefront .mtl file specifying materials
 */

import { vec2 } from 'gl-matrix';
import { Color } from '../Color';
import { Material } from '../materials/Material';
import { MeshPhongMaterial } from '../materials/MeshPhongMaterial';

class MTLLoader {
  materialOptions: any;
  setMaterialOptions(value: any) {
    this.materialOptions = value;
    return this;
  }

  /**
   * Parses a MTL file.
   *
   * @param {String} text - Content of MTL file
   * @return {MaterialCreator}
   *
   * @see setPath setResourcePath
   *
   * @note In order for relative texture references to resolve correctly
   * you must call setResourcePath() explicitly prior to parse.
   */
  parse(text: string, path: any) {
    const lines = text.split('\n');
    let info: { [key: string]: [number, number, number] | string } = {};
    const delimiter_pattern = /\s+/;
    const materialsInfo: MaterialInfo = {};

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      line = line.trim();

      if (line.length === 0 || line.charAt(0) === '#') {
        // Blank line or comment ignore
        continue;
      }

      const pos = line.indexOf(' ');

      let key = pos >= 0 ? line.substring(0, pos) : line;
      key = key.toLowerCase();

      let value = pos >= 0 ? line.substring(pos + 1) : '';
      value = value.trim();

      if (key === 'newmtl') {
        // New material

        info = { name: value };
        materialsInfo[value] = info;
      } else {
        if (key === 'ka' || key === 'kd' || key === 'ks' || key === 'ke') {
          const ss = value.split(delimiter_pattern, 3);
          info[key] = [parseFloat(ss[0]), parseFloat(ss[1]), parseFloat(ss[2])];
        } else {
          info[key] = value;
        }
      }
    }

    const materialCreator = new MaterialCreator(path, this.materialOptions);

    materialCreator.setMaterials(materialsInfo);
    return materialCreator;
  }
}

type MaterialInfo = {
  [key: string]: { [key: string]: [number, number, number] | string };
};

type vec3 = [number, number, number];

/**
 * Create a new MTLLoader.MaterialCreator
 * @param baseUrl - Url relative to which textures are loaded
 * @param options - Set of options on how to construct the materials
 *                  side: Which side to apply the material
 *                        FrontSide (default), THREE.BackSide, THREE.DoubleSide
 *                  wrap: What type of wrapping to apply for textures
 *                        RepeatWrapping (default), THREE.ClampToEdgeWrapping, THREE.MirroredRepeatWrapping
 *                  normalizeRGB: RGBs need to be normalized to 0-1 from 0-255
 *                                Default: false, assumed to be already normalized
 *                  ignoreZeroRGBs: Ignore values of RGBs (Ka,Kd,Ks) that are all 0's
 *                                  Default: false
 * @constructor
 */

class MaterialCreator {
  baseUrl: string;
  options: any;
  materialsInfo: MaterialInfo;
  materials: { [key: string]: Material };
  materialsArray: any[];
  nameLookup: { [key: string | number]: number };
  crossOrigin: string;

  side: any;
  wrap: any;

  constructor(baseUrl = '', options = {}) {
    this.baseUrl = baseUrl;
    this.options = options;
    this.materialsInfo = {};
    this.materials = {};
    this.materialsArray = [];
    this.nameLookup = {};

    this.crossOrigin = 'anonymous';

    // TODO
    // this.side =
    //     this.options.side !== undefined ? this.options.side : FrontSide;
    // this.wrap =
    //     this.options.wrap !== undefined
    //         ? this.options.wrap
    //         : RepeatWrapping;
  }

  setCrossOrigin(value: any) {
    this.crossOrigin = value;
    return this;
  }

  setMaterials(materialsInfo: MaterialInfo) {
    this.materialsInfo = this.convert(materialsInfo);
    this.materials = {};
    this.materialsArray = [];
    this.nameLookup = {};
  }

  convert(materialsInfo: MaterialInfo): MaterialInfo {
    if (!this.options) return materialsInfo;

    const converted: MaterialInfo = {};

    for (const mn in materialsInfo) {
      // Convert materials info into normalized form based on options

      const mat = materialsInfo[mn];

      const covmat: { [key: string]: [number, number, number] } = {};

      converted[mn] = covmat;

      for (const prop in mat) {
        let save = true;
        let value = mat[prop] as [number, number, number];
        const lprop = prop.toLowerCase();

        switch (lprop) {
          case 'kd':
          case 'ka':
          case 'ks':
            // Diffuse color (color under white light) using RGB values

            if (this.options && this.options.normalizeRGB) {
              value = [value[0] / 255, value[1] / 255, value[2] / 255];
            }

            if (this.options && this.options.ignoreZeroRGBs) {
              if (value[0] === 0 && value[1] === 0 && value[2] === 0) {
                // ignore

                save = false;
              }
            }

            break;

          default:
            break;
        }

        if (save) {
          covmat[lprop] = value;
        }
      }
    }

    return converted;
  }

  preload() {
    for (const mn in this.materialsInfo) {
      this.create(mn);
    }
  }

  getIndex(materialName: string | number): number {
    return this.nameLookup[materialName];
  }

  getAsArray() {
    let index = 0;

    for (const mn in this.materialsInfo) {
      this.materialsArray[index] = this.create(mn);
      this.nameLookup[mn] = index;
      index++;
    }

    return this.materialsArray;
  }

  create(materialName: string) {
    if (this.materials[materialName] === undefined) {
      this.createMaterial_(materialName);
    }

    return this.materials[materialName];
  }

  createMaterial_(materialName: string | number) {
    // Create material

    const scope = this;
    const mat = this.materialsInfo[materialName];
    const params: { [key: string]: any } = {
      name: materialName,
      side: this.side,
    };

    function resolveURL(baseUrl: string, url: string) {
      if (typeof url !== 'string' || url === '') return '';

      // Absolute URL
      if (/^https?:\/\//i.test(url)) return url;

      return baseUrl + url;
    }

    function setMapForType(mapType: string, value: any) {
      if (params[mapType]) return; // Keep the first encountered texture

      // TODO
      console.warn('MTLLoader: texture loader not implemented.');
      // const texParams = scope.getTextureParams(value, params);
      // const map = scope.loadTexture(
      //     resolveURL(scope.baseUrl, texParams.url)
      // );

      // map.repeat.copy(texParams.scale);
      // map.offset.copy(texParams.offset);

      // map.wrapS = scope.wrap;
      // map.wrapT = scope.wrap;

      // if (mapType === 'map' || mapType === 'emissiveMap') {
      //     map.colorSpace = SRGBColorSpace;
      // }

      // params[mapType] = map;
    }

    for (const prop in mat) {
      const value = mat[prop];
      let n;

      // ignore empty value
      if (value === '') continue;

      switch (prop.toLowerCase()) {
        // Ns is material specular exponent

        case 'kd':
          // Diffuse color (color under white light) using RGB values

          params.color = new Color(value as vec3).convertSRGBToLinear();

          break;

        case 'ks':
          // Specular color (color when light is reflected from shiny surface) using RGB values
          params.specular = new Color(value as vec3).convertSRGBToLinear();

          break;

        case 'ke':
          // Emissive using RGB values
          params.emissive = new Color(value as vec3).convertSRGBToLinear();

          break;

        case 'map_kd':
          // Diffuse texture map

          setMapForType('map', value);

          break;

        case 'map_ks':
          // Specular map

          setMapForType('specularMap', value);

          break;

        case 'map_ke':
          // Emissive map

          setMapForType('emissiveMap', value);

          break;

        case 'norm':
          setMapForType('normalMap', value);

          break;

        case 'map_bump':
        case 'bump':
          // Bump texture map

          setMapForType('bumpMap', value);

          break;

        case 'map_d':
          // Alpha map

          setMapForType('alphaMap', value);
          params.transparent = true;

          break;

        case 'ns':
          // The specular exponent (defines the focus of the specular highlight)
          // A high exponent results in a tight, concentrated highlight. Ns values normally range from 0 to 1000.

          params.shininess = parseFloat(value as string);

          break;

        case 'd':
          n = parseFloat(value as string);

          if (n < 1) {
            params.opacity = n;
            params.transparent = true;
          }

          break;

        case 'tr':
          n = parseFloat(value as string);

          if (this.options && this.options.invertTrProperty) n = 1 - n;

          if (n > 0) {
            params.opacity = 1 - n;
            params.transparent = true;
          }

          break;

        default:
          break;
      }
    }

    this.materials[materialName] = new MeshPhongMaterial(params);
    return this.materials[materialName];
  }

  getTextureParams(
    value: string,
    matParams: { name?: any; side?: any; bumpScale?: any }
  ) {
    const texParams: { scale: vec2; offset: vec2; url?: string } = {
      scale: vec2.fromValues(1, 1),
      offset: vec2.fromValues(0, 0),
    };

    const items = value.split(/\s+/);
    let pos;

    pos = items.indexOf('-bm');

    if (pos >= 0) {
      matParams.bumpScale = parseFloat(items[pos + 1]);
      items.splice(pos, 2);
    }

    pos = items.indexOf('-s');

    if (pos >= 0) {
      vec2.set(
        texParams.scale,
        parseFloat(items[pos + 1]),
        parseFloat(items[pos + 2])
      );
      items.splice(pos, 4); // we expect 3 parameters here!
    }

    pos = items.indexOf('-o');

    if (pos >= 0) {
      vec2.set(
        texParams.offset,
        parseFloat(items[pos + 1]),
        parseFloat(items[pos + 2])
      );
      items.splice(pos, 4); // we expect 3 parameters here!
    }

    texParams.url = items.join(' ').trim();
    return texParams;
  }

  loadTexture(
    url: string,
    mapping: any,
    onLoad: any,
    onProgress: any,
    onError: any
  ) {
    // TODO
    console.warn('TODO: texture load.');
    // const manager =
    //     this.manager !== undefined ? this.manager : DefaultLoadingManager;
    // let loader = manager.getHandler(url);

    // if (loader === null) {
    //     loader = new TextureLoader(manager);
    // }

    // if (loader.setCrossOrigin) loader.setCrossOrigin(this.crossOrigin);

    // const texture = loader.load(url, onLoad, onProgress, onError);

    // if (mapping !== undefined) texture.mapping = mapping;

    // return texture;
  }
}

export { MTLLoader, MaterialCreator };