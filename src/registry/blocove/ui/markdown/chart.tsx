import type { ChartConfig } from '@/components/ui/chart'
/* eslint-disable react/no-array-index-key -- pie slices are positional, so the row index is the stable identity. */

import type { MarkdownChartSpec } from '@/lib/blocove/markdown-chart'
import type { MarkdownCodeProps } from '@/lib/blocove/markdown-parse'
import { cn } from 'cn'
import { useMemo, useSyncExternalStore } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from '@/components/ui/code-block'
import { parseMarkdownChart } from '@/lib/blocove/markdown-chart'

export interface MarkdownChartProps extends MarkdownCodeProps {
  className?: string
}

const subscribeToNothing = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

/** The client boundary without a state write in an effect. */
function useMounted(): boolean {
  return useSyncExternalStore(subscribeToNothing, getClientSnapshot, getServerSnapshot)
}

function chartConfigOf(spec: MarkdownChartSpec): ChartConfig {
  const config: ChartConfig = {}

  if (spec.type === 'pie') {
    spec.data.forEach((row, index) => {
      config[`s${index}`] = {
        color: `var(--chart-${(index % 5) + 1})`,
        label: String(row[spec.x]),
      }
    })

    return config
  }

  spec.series.forEach((series, index) => {
    config[series.key] = {
      color: `var(--chart-${(index % 5) + 1})`,
      label: series.label,
    }
  })

  return config
}

function ChartBody({ spec }: { spec: MarkdownChartSpec }) {
  const config = useMemo(() => chartConfigOf(spec), [spec])
  const label = `${spec.type} chart${spec.title
    ? `: ${spec.title}`
    : ''}`
  const showLegend = spec.type === 'pie' || spec.series.length > 1

  if (spec.type === 'pie') {
    return (
      <ChartContainer config={config} className="aspect-auto h-60 w-full" aria-label={label}>
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey={spec.x} />} />
          <ChartLegend content={<ChartLegendContent nameKey={spec.x} />} />
          <Pie
            data={spec.data}
            dataKey={spec.series[0].key}
            nameKey={spec.x}
            innerRadius={56}
            outerRadius={84}
            paddingAngle={2}
          >
            {spec.data.map((_, index) => (
              <Cell key={index} fill={`var(--color-s${index})`} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer config={config} className="aspect-auto h-60 w-full" aria-label={label}>
      {spec.type === 'bar'
        ? (
            <BarChart data={spec.data} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey={spec.x} tickLine={false} axisLine={false} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              {showLegend
                ? <ChartLegend content={<ChartLegendContent />} />
                : null}
              {spec.series.map(series => (
                <Bar
                  key={series.key}
                  dataKey={series.key}
                  fill={`var(--color-${series.key})`}
                  radius={[4, 4, 0, 0]}
                  stackId={spec.stacked ? 'stack' : undefined}
                />
              ))}
            </BarChart>
          )
        : spec.type === 'line'
          ? (
              <LineChart data={spec.data} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey={spec.x} tickLine={false} axisLine={false} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                {showLegend
                  ? <ChartLegend content={<ChartLegendContent />} />
                  : null}
                {spec.series.map(series => (
                  <Line
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    stroke={`var(--color-${series.key})`}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            )
          : (
              <AreaChart data={spec.data} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey={spec.x} tickLine={false} axisLine={false} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                {showLegend
                  ? <ChartLegend content={<ChartLegendContent />} />
                  : null}
                {spec.series.map(series => (
                  <Area
                    key={series.key}
                    type="natural"
                    dataKey={series.key}
                    fill={`var(--color-${series.key})`}
                    fillOpacity={0.35}
                    stackId={spec.stacked ? 'stack' : undefined}
                  />
                ))}
              </AreaChart>
            )}
    </ChartContainer>
  )
}

/**
 * Chart renderer for the markdown shell, built on the shadcn/ui chart item.
 *
 * Register it through the shell's fence map:
 *
 * ```tsx
 * <Markdown source={source} components={{ fences: { chart: MarkdownChart } }} />
 * ```
 *
 * The fence body is a small JSON spec parsed by `parseMarkdownChart`. While the
 * fence is open, or when the spec does not validate, the fence stays the source
 * code block and the reason is shown once the fence is complete. A valid spec
 * renders client-side, because Recharts needs the measured width.
 */
export function MarkdownChart({
  code,
  streaming,
  complete,
  className,
}: MarkdownChartProps) {
  const mounted = useMounted()
  const parsed = useMemo(() => parseMarkdownChart(code), [code])
  const spec = 'spec' in parsed
    ? parsed.spec
    : undefined
  const error = 'error' in parsed
    ? parsed.error
    : undefined
  const title = spec?.title ?? 'chart'

  return (
    <CodeBlock
      data-language="chart"
      data-streaming={streaming || undefined}
      className={cn(className)}
    >
      <CodeBlockHeader>
        <CodeBlockTitle className="text-muted-foreground">{title}</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={code} aria-label="Copy chart source" />
        </CodeBlockActions>
      </CodeBlockHeader>
      {!complete || !mounted || error !== undefined || spec === undefined
        ? (
            <>
              <CodeBlockContent>{code}</CodeBlockContent>
              {complete && error !== undefined
                ? (
                    <p role="status" className="px-3 pb-3 text-xs text-destructive">
                      {error}
                    </p>
                  )
                : null}
            </>
          )
        : (
            <div className="min-w-0 p-3">
              <ChartBody spec={spec} />
            </div>
          )}
    </CodeBlock>
  )
}
