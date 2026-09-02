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

  const option = {
    title: {
      text: by === 'projects' ? 'Languages used (by project)' : 'Languages used (by years used)',
      left: 'center',
      textStyle: { color: '#ccc' },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: { name: string; value: number }) =>
        `${params.name}: ${params.value} ${by}`,
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '80%'],
        label: { show: true, fontWeight: 'bold' },
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
