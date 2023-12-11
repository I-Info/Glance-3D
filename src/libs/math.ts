import { mat4 } from 'gl-matrix';

/**
 * Generates a orthogonal projection matrix with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
 * which matches WebGL/OpenGL's clip volume.
 *
 * @param out - mat4 frustum matrix will be written into
 * @param left - Left bound of the frustum
 * @param right - Right bound of the frustum
 * @param bottom - Bottom bound of the frustum
 * @param top - Top bound of the frustum
 * @param near - Near bound of the frustum
 * @param far - Far bound of the frustum
 * @returns `out`
 *
 * **Note**: referred from `gl-matrix` mat4.ortho function, with Z-axis direction patched.
 */
export function ortho(
  out: mat4,
  left: number,
  right: number,
  bottom: number,
  top: number,
  near: number,
  far: number
): mat4 {
  const lr = 1 / (left - right);
  const bt = 1 / (bottom - top);
  const nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = -2 * nf; // Patched
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}
