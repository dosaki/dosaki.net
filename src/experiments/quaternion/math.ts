export type Quat = [number, number, number, number] // [w, x, y, z]
export type Vec3 = [number, number, number]
export type Mat3 = [Vec3, Vec3, Vec3]
export type Axis = 'x' | 'y' | 'z'
export type Angles = { yaw: number; pitch: number; roll: number }

export const DEG = Math.PI / 180
export const IDENTITY: Quat = [1, 0, 0, 0]
export const AXES: Record<Axis, Vec3> = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
export const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k]
export const dot3 = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
export const unit = (v: Vec3): Vec3 => {
  const n = Math.hypot(...v)
  return n < 1e-12 ? v : scale(v, 1 / n)
}

const qdot = (a: Quat, b: Quat) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]

export const Q = {
  mul: (a: Quat, b: Quat): Quat => [
    a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
    a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
    a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
    a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
  ],
  map: (q: Quat, f: (c: number) => number): Quat => [f(q[0]), f(q[1]), f(q[2]), f(q[3])],
  conj: (q: Quat): Quat => [q[0], -q[1], -q[2], -q[3]],
  neg: (q: Quat) => Q.map(q, (c) => -c),
  norm: (q: Quat) => Math.hypot(...q),
  normalize(q: Quat): Quat {
    const n = Q.norm(q)
    return n < 1e-9 ? [...IDENTITY] : Q.map(q, (c) => c / n)
  },
  fromAxisAngle(axis: Vec3, rad: number): Quat {
    const n = Math.hypot(...axis)
    if (n < 1e-9) return [...IDENTITY]
    const s = Math.sin(rad / 2) / n
    return [Math.cos(rad / 2), axis[0] * s, axis[1] * s, axis[2] * s]
  },
  // q v q*. Not normalised, so a non-unit q also scales v by |q|².
  rotate(q: Quat, v: Vec3): Vec3 {
    const [, x, y, z] = Q.mul(Q.mul(q, [0, ...v]), Q.conj(q))
    return [x, y, z]
  },
  // Never flips to the shorter arc: the page shows the long way round on purpose.
  slerp(a: Quat, b: Quat, t: number): Quat {
    const th = Math.acos(clamp(qdot(a, b), -1, 1))
    if (th < 1e-6) return [...b]
    const s = Math.sin(th)
    if (Math.abs(s) < 1e-6) {
      // Opposite quaternions: any great circle works, so go via a turn about Y.
      const mid = Q.mul(a, [0, 0, 1, 0])
      return t < 0.5 ? Q.slerp(a, mid, t * 2) : Q.slerp(mid, b, t * 2 - 1)
    }
    const ka = Math.sin((1 - t) * th) / s
    const kb = Math.sin(t * th) / s
    return [0, 1, 2, 3].map((i) => a[i] * ka + b[i] * kb) as Quat
  },
  matrix([w, x, y, z]: Quat): Mat3 {
    return [
      [1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)],
      [2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)],
      [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)],
    ]
  },
}

export const M3 = {
  I: (): Mat3 => [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  map: (A: Mat3, f: (c: number) => number): Mat3 => [
    [f(A[0][0]), f(A[0][1]), f(A[0][2])],
    [f(A[1][0]), f(A[1][1]), f(A[1][2])],
    [f(A[2][0]), f(A[2][1]), f(A[2][2])],
  ],
  apply: (A: Mat3, v: Vec3): Vec3 => [dot3(A[0], v), dot3(A[1], v), dot3(A[2], v)],
  col: (A: Mat3, j: number): Vec3 => [A[0][j], A[1][j], A[2][j]],
  fromCols: (a: Vec3, b: Vec3, c: Vec3): Mat3 => [
    [a[0], b[0], c[0]],
    [a[1], b[1], c[1]],
    [a[2], b[2], c[2]],
  ],
  T: (A: Mat3): Mat3 => M3.fromCols(A[0], A[1], A[2]),
  mul: (A: Mat3, B: Mat3): Mat3 => M3.fromCols(M3.apply(A, M3.col(B, 0)), M3.apply(A, M3.col(B, 1)), M3.apply(A, M3.col(B, 2))),
  det: (A: Mat3) => dot3(A[0], cross(A[1], A[2])),
  // Makes the columns unit length and at right angles again.
  gramSchmidt(A: Mat3): Mat3 {
    const e0 = unit(M3.col(A, 0))
    const c1 = M3.col(A, 1)
    const e1 = unit(sub(c1, scale(e0, dot3(c1, e0))))
    return M3.fromCols(e0, e1, cross(e0, e1))
  },
}

// Euler angles in Y·X·Z order: yaw, then pitch, then roll.
export const fromEuler = ({ yaw, pitch, roll }: Angles): Quat =>
  Q.mul(
    Q.mul(Q.fromAxisAngle(AXES.y, yaw * DEG), Q.fromAxisAngle(AXES.x, pitch * DEG)),
    Q.fromAxisAngle(AXES.z, roll * DEG),
  )

export function toEuler(q: Quat): Angles & { locked: boolean } {
  const m = Q.matrix(q)
  const sp = clamp(-m[1][2], -1, 1)
  const pitch = Math.asin(sp) / DEG
  if (Math.abs(sp) > 1 - 1e-9) {
    // Locked: only yaw − roll is defined, so call roll 0.
    return { yaw: Math.atan2(-m[2][0], m[0][0]) / DEG, pitch, roll: 0, locked: true }
  }
  return {
    yaw: Math.atan2(m[0][2], m[2][2]) / DEG,
    pitch,
    roll: Math.atan2(m[1][0], m[1][1]) / DEG,
    locked: false,
  }
}

// Leading space on positives so columns line up; tiny negatives print as 0.
export const fmt = (v: number, d = 3) => {
  const s = (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toFixed(d)
  return s[0] === '-' ? s : ' ' + s
}
export const fmtQ = (q: Quat) => q.map((c) => fmt(c)).join(', ')
