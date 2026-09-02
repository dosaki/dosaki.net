import ReactEChartsCore from 'echarts-for-react/esm/core'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { chartValue } from '../content/ordering'
import type { LanguageMap } from '../content/types'

echarts.use([TooltipComponent, LegendComponent, TitleComponent, PieChart, CanvasRenderer])

/** Positional, aligned with the ten seed languages. */
const COLOURS = [
  '#f7e018', '#4298b8', '#ea2d2e', '#36008e', '#00acd7',
  '#00007c', '#5c41e2', '#888888', '#f7c93e', '#293036',
]

export type ChartMode = 'projects' | 'years'

interface LanguageChartProps {
  languages: LanguageMap
  by: ChartMode
}

/**
 * jsdom has no canvas backend (no `canvas` npm package), so
 * `HTMLCanvasElement#getContext('2d')` resolves to `null` there and
 * echarts' canvas renderer throws when it tries to use it. Real browsers
 * always support this, so the chart only mounts where it can actually draw.
 */
const supportsCanvas =
  typeof document !== 'undefined' &&
  Boolean(document.createElement('canvas').getContext('2d'))

export function LanguageChart({ languages, by }: LanguageChartProps) {
  const data = Object.entries(languages).map(([name, stat]) => ({
    name,
    value: chartValue(stat, by),
  }))

  // echarts is configured in TypeScript and cannot read CSS custom
  // properties, so this chrome (title/tooltip/label/slice border) is the
  // one sanctioned exception to the tokens-only rule. These literals mirror
  // --color-text (#F8F5E9), --color-surface (#0B0F16) and --color-border
  // (#334155) from src/styles/tokens.css. The ten-colour series palette
  // (COLOURS) is language-identity colour and is deliberately left alone.
  const option = {
    title: {
      text: by === 'projects' ? 'Languages used (by project)' : 'Languages used (by years used)',
      left: 'center',
      textStyle: {
        color: '#F8F5E9',
        fontFamily: 'Poppins, system-ui, sans-serif',
        fontWeight: 600,
        fontSize: 15,
      },
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#0B0F16',
      borderColor: '#334155',
      textStyle: { color: '#F8F5E9', fontFamily: 'Inter, system-ui, sans-serif' },
      formatter: (params: { name: string; value: number }) =>
        `${params.name}: ${params.value} ${by}`,
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '80%'],
        label: {
          show: true,
          color: '#F8F5E9',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 600,
        },
        itemStyle: { borderColor: '#0B0F16', borderWidth: 2 },
        data,
        color: COLOURS,
      },
    ],
  }

  if (!supportsCanvas) {
    return <p>Language chart unavailable (canvas rendering is not supported here).</p>
  }

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height: 400 }}
      notMerge
    />
  )
}
