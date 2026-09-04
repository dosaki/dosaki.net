// Minimal ambient shim for the one Node built-in this codebase imports
// (src/styles/__tests__/contrast.test.ts). The project has no @types/node
// dependency — adding one is out of scope for this task — so TypeScript
// cannot otherwise resolve `node:fs`. This declares only the signature
// actually used: readFileSync(path, encoding) => string.
declare module 'node:fs' {
  export function readFileSync(path: string | URL, encoding: string): string
}
