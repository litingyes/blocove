import type { DocsPage } from '@/docs/types'
import MarkdownChartDemo from '@/docs/examples/markdown/chart'
import { markdownDemoContent } from '@/docs/examples/markdown/content'
import { markdownChartUsage } from '@/docs/snippets/markdown'

export const docsPage: DocsPage = {
  item: 'markdown-chart',
  requiresTypeset: true,
  demoDeps: ['markdown'],
  examples: [
    {
      title: 'Default',
      component: MarkdownChartDemo,
      code: markdownChartUsage(markdownDemoContent.chart),
    },
  ],
  usage: [
    {
      title: 'Model contract',
      language: 'text',
      code: [
        'When a chart helps, answer with a chart fence whose body is one JSON object.',
        'Tell the model the fence language and this schema, or it will keep writing prose:',
        '',
        '{',
        '  "type": "bar",',
        '  "title": "MRR by month",',
        '  "x": "month",',
        '  "series": [{ "key": "mrr", "label": "MRR" }],',
        '  "data": [{ "month": "Jan", "mrr": 120 }, { "month": "Feb", "mrr": 140 }]',
        '}',
        '',
        '"type" is "bar", "line", "area" or "pie"; "x" is the category key;',
        '"series" lists the numeric keys with their labels; "data" holds the rows.',
        'A pie needs exactly one series, 1-12 rows and non-negative values.',
        'A bar or area chart can stack its series with "stacked": true.',
      ].join('\n'),
    },
  ],
  note: 'A `chart` fence carries one JSON object and renders through the shadcn/ui chart item: bar, line, area and pie, with tooltip and legend, colored from `--chart-*`. The fence stays as source until it closes and the spec validates; a spec that does not validate keeps the source and shows the reason. Bar, line and area values are finite numbers or `null` (a gap); a pie needs exactly one series, 1–12 slices with unique names and non-negative values. Charts render client-side because Recharts needs the measured width.',
  api: [
    {
      name: 'MarkdownChart',
      description:
        'The chart fence renderer. The shell passes `language`, `code`, `streaming` and `complete`; register it through `components.fences`. It renders the source until `complete` is set and the spec validates, then mounts the chart.',
      extends: 'MarkdownCodeProps',
      rows: [
        { prop: 'language', type: 'string', default: 'Required' },
        { prop: 'code', type: 'string', default: 'Required' },
        { prop: 'streaming', type: 'boolean', default: '-' },
        { prop: 'complete', type: 'boolean', default: '-' },
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
    {
      name: 'MarkdownChartSpec',
      description:
        'The JSON body of a `chart` fence, validated by `parseMarkdownChart` before anything renders.',
      rows: [
        { prop: 'type', type: '\'bar\' | \'line\' | \'area\' | \'pie\'', default: 'Required' },
        { prop: 'title', type: 'string', default: '-' },
        { prop: 'x', type: 'string', default: 'Required' },
        { prop: 'stacked', type: 'boolean', default: '-' },
        { prop: 'series', type: 'MarkdownChartSeries[]', default: 'Required' },
        { prop: 'data', type: 'MarkdownChartRow[]', default: 'Required' },
      ],
    },
  ],
}
