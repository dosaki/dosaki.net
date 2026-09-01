import '@testing-library/jest-dom/vitest'

// jsdom has no layout engine; the router's scroll restoration calls this.
window.scrollTo = () => {}

// jsdom has no canvas backend. Returning null here matches what jsdom would
// report anyway, and keeps its "Not implemented" notice out of test output.
// LanguageChart feature-detects this and skips mounting the chart.
HTMLCanvasElement.prototype.getContext = () => null
