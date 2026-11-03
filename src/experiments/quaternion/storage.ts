import { DEG, Q, clamp, fromEuler, toEuler, type Angles, type Quat } from './math'

// Two ways a game might save an orientation in a fixed number of bits per
// number, and load it back.

// Snap v to one of 2^bits evenly spaced values between lo and hi.
const snap = (v: number, lo: number, hi: number, bits: number) => {
  const steps = 2 ** bits - 1
  return lo + (Math.round(((clamp(v, lo, hi) - lo) / (hi - lo)) * steps) / steps) * (hi - lo)
}

// Yaw and roll wrap around, so all 2^bits values are distinct angles.
const snapAngle = (deg: number, bits: number) => {
  const step = 360 / 2 ** bits
  const v = Math.round(deg / step) * step
  return v >= 180 ? v - 360 : v
}

export function saveEuler(q: Quat, bits: number): Angles {
  const e = toEuler(q)
  return { yaw: snapAngle(e.yaw, bits), pitch: snap(e.pitch, -90, 90, bits), roll: snapAngle(e.roll, bits) }
}
export const loadEuler = (e: Angles) => fromEuler(e)

// "Smallest three": drop the largest of the four numbers, which can be worked
// out from the others because |q| = 1. The other three always lie within ±1/√2.
const LIMIT = Math.SQRT1_2

export interface SmallestThree {
  dropped: number
  rest: number[]
}

export function saveQuat(q: Quat, bits: number): SmallestThree {
  const dropped = q.reduce((best, c, i) => (Math.abs(c) > Math.abs(q[best]) ? i : best), 0)
  // q and −q are the same rotation, so make the dropped number positive.
  const signed = q[dropped] < 0 ? Q.neg(q) : q
  return { dropped, rest: signed.filter((_, i) => i !== dropped).map((c) => snap(c, -LIMIT, LIMIT, bits)) }
}

export function loadQuat({ dropped, rest }: SmallestThree): Quat {
  const big = Math.sqrt(Math.max(0, 1 - rest.reduce((sum, c) => sum + c * c, 0)))
  const q = [...rest]
  q.splice(dropped, 0, big)
  return Q.normalize(q as Quat)
}

// How far apart two orientations are, in degrees.
export const angleBetween = (a: Quat, b: Quat) => (2 * Math.acos(clamp(Math.abs(Q.dot(a, b)), 0, 1))) / DEG
