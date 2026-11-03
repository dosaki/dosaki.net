// Minimal ambient shim for node:fs, since the project has no @types/node.
// Declares only what the tests and vite.config.ts use.
declare module 'node:fs' {
  export function readFileSync(path: string | URL, encoding: string): string
  export function writeFileSync(path: string, data: string): void
  export function mkdirSync(path: string, options: { recursive: boolean }): void
}
