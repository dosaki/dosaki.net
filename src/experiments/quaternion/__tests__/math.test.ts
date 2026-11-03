// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { DEG, M3, Q, fmt, fromEuler, toEuler, type Quat, type Vec3 } from '../math'

const close = (a: readonly number[], b: readonly number[], digits = 9) =>
  a.forEach((v, i) => expect(v).toBeCloseTo(b[i], digits))

describe('quaternions', () => {
  it('follows Hamilton’s rules: ij = k but ji = −k', () => {
    const i: Quat = [0, 1, 0, 0]
    const j: Quat = [0, 0, 1, 0]
    expect(Q.mul(i, j)).toEqual([0, 0, 0, 1])
    expect(Q.mul(j, i)).toEqual([0, 0, 0, -1])
  })

  it('rotates +X to +Y with a 90° turn about Z', () => {
    close(Q.rotate(Q.fromAxisAngle([0, 0, 1], 90 * DEG), [1, 0, 0]), [0, 1, 0])
  })

  it('gives the same pose for q and −q', () => {
    const q = Q.fromAxisAngle([1, 2, 3], 1.1)
    const v: Vec3 = [0.3, -1, 2]
    close(Q.rotate(q, v), Q.rotate(Q.neg(q), v))
  })

  it('agrees with its own rotation matrix', () => {
    const q = Q.fromAxisAngle([-2, 1, 0.5], 2.3)
    const v: Vec3 = [1, 1, 1]
    close(M3.apply(Q.matrix(q), v), Q.rotate(q, v))
  })

  it('normalises the all-zero quaternion to the identity rather than NaN', () => {
    expect(Q.normalize([0, 0, 0, 0])).toEqual([1, 0, 0, 0])
  })

  it('slerps through the halfway rotation', () => {
    const q = Q.fromAxisAngle([0, 1, 0], 120 * DEG)
    close(Q.slerp([1, 0, 0, 0], q, 0.5), Q.fromAxisAngle([0, 1, 0], 60 * DEG))
  })

  it('slerps between opposite quaternions without dividing by zero', () => {
    const mid = Q.slerp([1, 0, 0, 0], [-1, 0, 0, 0], 0.5)
    expect(Q.norm(mid)).toBeCloseTo(1)
  })
})

describe('matrices', () => {
  it('Gram–Schmidt turns a skewed matrix back into a rotation', () => {
    const skewed = M3.map(Q.matrix(Q.fromAxisAngle([1, 2, 3], 0.7)), (c) => c * 1.1 + 0.03)
    const fixed = M3.gramSchmidt(skewed)
    close(M3.mul(M3.T(fixed), fixed).flat(), M3.I().flat())
    expect(M3.det(fixed)).toBeCloseTo(1)
  })
})

describe('Euler angles', () => {
  it('round-trips away from the lock', () => {
    const e = toEuler(fromEuler({ yaw: 40, pitch: 30, roll: -70 }))
    close([e.yaw, e.pitch, e.roll], [40, 30, -70])
    expect(e.locked).toBe(false)
  })

  it('cannot separate yaw from roll at pitch 90°', () => {
    // At pitch +90° the roll axis lies along −yaw, so only yaw − roll matters:
    // these two different inputs are the same orientation.
    const a = toEuler(fromEuler({ yaw: 30, pitch: 90, roll: 10 }))
    const b = toEuler(fromEuler({ yaw: 45, pitch: 90, roll: 25 }))
    expect(a.locked).toBe(true)
    close([a.yaw, a.roll], [b.yaw, b.roll], 6)
  })
})

describe('fmt', () => {
  it('pads positives so columns line up, and never prints −0', () => {
    expect(fmt(0.5)).toBe(' 0.500')
    expect(fmt(-0.5)).toBe('-0.500')
    expect(fmt(-0.0001)).toBe(' 0.000')
  })
})
