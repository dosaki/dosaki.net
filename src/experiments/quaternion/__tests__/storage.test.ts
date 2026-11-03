// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { type Quat } from '../math'
import { angleBetween, loadEuler, loadQuat, saveEuler, saveQuat } from '../storage'

// Deterministic, uniformly random rotations (Shoemake's method).
let seed = 1
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
const randomRotation = (): Quat => {
  const [u, a, b] = [rnd(), rnd() * 2 * Math.PI, rnd() * 2 * Math.PI]
  return [Math.sqrt(1 - u) * Math.sin(a), Math.sqrt(1 - u) * Math.cos(a), Math.sqrt(u) * Math.sin(b), Math.sqrt(u) * Math.cos(b)]
}
const rotations = Array.from({ length: 5000 }, randomRotation)
const viaEuler = (q: Quat, bits: number) => loadEuler(saveEuler(q, bits))
const viaQuat = (q: Quat, bits: number) => loadQuat(saveQuat(q, bits))

describe('saving a rotation in a few bits', () => {
  it('Euler angles move the object on the first visit, then never again', () => {
    for (const q of rotations) {
      const first = viaEuler(q, 6)
      expect(angleBetween(first, viaEuler(first, 6))).toBeLessThan(1e-4)
    }
  })

  it('the quaternion is closer on average with the same number of bits', () => {
    const mean = (f: (q: Quat) => Quat) => rotations.reduce((sum, q) => sum + angleBetween(q, f(q)), 0) / rotations.length
    const euler = mean((q) => viaEuler(q, 8))
    const quat = mean((q) => viaQuat(q, 8))
    expect(quat).toBeLessThan(euler * 0.7)
  })

  it('the quaternion can flip between two saves on later visits', () => {
    const flips = rotations.filter((q) => {
      const first = viaQuat(q, 5)
      return angleBetween(first, viaQuat(first, 5)) > 1e-4
    })
    expect(flips.length).toBeGreaterThan(0)
    expect(flips.length).toBeLessThan(rotations.length * 0.1)
  })

  it('16 bits is accurate to well under a hundredth of a degree', () => {
    for (const q of rotations.slice(0, 500)) {
      expect(angleBetween(q, viaEuler(q, 16))).toBeLessThan(0.01)
      expect(angleBetween(q, viaQuat(q, 16))).toBeLessThan(0.01)
    }
  })
})
