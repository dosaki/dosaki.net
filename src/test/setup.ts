import '@testing-library/jest-dom/vitest'

// This setup file runs for every test file, including ones that opt into the
// `node` environment via a `@vitest-environment node` docblock (no DOM
// globals available). Guard the jsdom-only patches below so those files
// don't crash on load.
if (typeof window !== 'undefined') {
  // jsdom has no layout engine; the router's scroll restoration calls this.
  window.scrollTo = () => {}
}
