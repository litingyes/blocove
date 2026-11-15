import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MarkdownChart } from '@/components/blocove/markdown/chart'

vi.mock('recharts', () => ({
  BarChart: ({ children }: { children?: ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  LineChart: () => null,
  Line: () => null,
  AreaChart: () => null,
  Area: () => null,
  PieChart: () => null,
  Pie: () => null,
  Cell: () => null,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
}))

vi.mock('@/components/ui/chart', () => ({
  ChartContainer: ({ children }: { children?: ReactNode }) => <div data-slot="chart">{children}</div>,
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
  ChartLegend: () => null,
  ChartLegendContent: () => null,
}))

const spec = JSON.stringify({
  type: 'bar',
  title: 'MRR by month',
  x: 'month',
  series: [
    { key: 'mrr', label: 'MRR' },
  ],
  data: [
    { month: 'Jan', mrr: 120 },
  ],
})

describe('markdownChart', () => {
  it('shows the JSON source while the fence is open', () => {
    render(<MarkdownChart language="chart" code={spec} complete={false} />)

    expect(screen.getByText(/"type":"bar"/)).toBeDefined()
    expect(document.querySelector('[data-slot="chart"]')).toBeNull()
  })

  it('renders the chart once complete and mounted', async () => {
    render(<MarkdownChart language="chart" code={spec} complete />)

    await waitFor(() => expect(document.querySelector('[data-slot="chart"]')).not.toBeNull())
    expect(screen.getByText('MRR by month')).toBeDefined()
  })

  it('shows the source and the reason when the spec is invalid', () => {
    render(<MarkdownChart language="chart" code="{" complete />)

    expect(screen.getByRole('status').textContent).toContain('JSON')
    expect(document.querySelector('[data-slot="chart"]')).toBeNull()
  })
})
