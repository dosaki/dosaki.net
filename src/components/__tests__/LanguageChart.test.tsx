import { describe, it, expect } from 'vitest'
import ReactEChartsCore from 'echarts-for-react/esm/core'

describe('LanguageChart echarts import', () => {
  // Regression guard for a production crash: importing the CommonJS
  // `echarts-for-react/lib/core` build under Vite's CJS interop resolves to
  // an object, not the component, and React throws "Element type is
  // invalid" the moment LanguageChart tries to render it. jsdom has no
  // canvas, so LanguageChart itself always takes its text-fallback path in
  // tests and never exercises this import at render time — this test only
  // checks that the module specifier still resolves to a callable
  // component under Vitest's transform. It would have caught the exact
  // regression of pointing the import back at `lib/core`, but it is not a
  // substitute for an actual browser render: Vitest's module transform
  // differs from Vite's production/dev bundling of deep CJS paths, so this
  // cannot prove the real browser bug is fixed or stays fixed.
  it('resolves the echarts core export to a renderable component', () => {
    expect(typeof ReactEChartsCore).toBe('function')
  })
})
