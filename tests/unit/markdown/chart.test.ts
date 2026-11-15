import { describe, expect, it } from 'vitest'
import { parseMarkdownChart } from '@/lib/blocove/markdown-chart'

const valid = JSON.stringify({
  type: 'bar',
  title: 'MRR by month',
  x: 'month',
  series: [
    { key: 'mrr', label: 'MRR' },
  ],
  data: [
    { month: 'Jan', mrr: 120 },
    { month: 'Feb', mrr: 140 },
  ],
})

describe('parseMarkdownChart', () => {
  it('parses a valid spec and ignores unknown fields', () => {
    const result = parseMarkdownChart(`${valid.slice(0, -1)},"extra":true}`)

    expect(result).toMatchObject({
      spec: { type: 'bar', x: 'month' },
    })
  })

  it('rejects invalid JSON', () => {
    expect(parseMarkdownChart('{')).toMatchObject({
      error: expect.stringMatching(/JSON/),
    })
  })

  it('rejects an unknown type', () => {
    expect(parseMarkdownChart(valid.replace('"bar"', '"scatter"')))
      .toMatchObject({
        error: expect.stringMatching(/type/),
      })
  })

  it('accepts labels and titles with spaces', () => {
    const result = parseMarkdownChart(JSON.stringify({
      type: 'bar',
      title: 'Monthly recurring revenue (USD)',
      x: 'month',
      series: [
        { key: 'mrr', label: 'Monthly recurring revenue' },
      ],
      data: [
        { month: 'Jan', mrr: 120 },
      ],
    }))

    expect(result).toMatchObject({
      spec: { title: 'Monthly recurring revenue (USD)' },
    })
  })

  it('rejects an empty series list', () => {
    expect(parseMarkdownChart(JSON.stringify({
      type: 'bar',
      x: 'month',
      series: [],
      data: [
        { month: 'Jan' },
      ],
    })))
      .toMatchObject({
        error: expect.stringMatching(/series/),
      })
  })

  it('rejects a series key that cannot become a CSS variable', () => {
    const result = parseMarkdownChart(JSON.stringify({
      type: 'line',
      x: 'month',
      series: [
        { key: 'mrr amount', label: 'MRR' },
      ],
      data: [
        { 'month': 'Jan', 'mrr amount': 1 },
      ],
    }))

    expect(result).toMatchObject({
      error: expect.stringMatching(/series\[0\]\.key/),
    })
  })

  it('rejects a non-numeric value', () => {
    const result = parseMarkdownChart(JSON.stringify({
      type: 'bar',
      x: 'month',
      series: [
        { key: 'mrr', label: 'MRR' },
      ],
      data: [
        { month: 'Jan', mrr: '120' },
      ],
    }))

    expect(result).toMatchObject({
      error: expect.stringMatching(/data\[0\]\.mrr/),
    })
  })

  it('accepts arbitrary slice names for a pie', () => {
    const result = parseMarkdownChart(JSON.stringify({
      type: 'pie',
      x: 'country',
      series: [
        { key: 'share', label: 'Share' },
      ],
      data: [
        { country: 'United States', share: 40 },
        { country: '日本', share: 60 },
      ],
    }))

    expect(result).toMatchObject({
      spec: { type: 'pie' },
    })
  })

  it('rejects a pie with more than one series', () => {
    const result = parseMarkdownChart(JSON.stringify({
      type: 'pie',
      x: 'country',
      series: [
        { key: 'a', label: 'A' },
        { key: 'b', label: 'B' },
      ],
      data: [
        { country: 'x', a: 1, b: 2 },
      ],
    }))

    expect(result).toMatchObject({
      error: expect.stringMatching(/pie/),
    })
  })

  it('rejects a pie with a null value', () => {
    const result = parseMarkdownChart(JSON.stringify({
      type: 'pie',
      x: 'country',
      series: [
        { key: 'share', label: 'Share' },
      ],
      data: [
        { country: 'x', share: null },
      ],
    }))

    expect(result).toMatchObject({
      error: expect.stringMatching(/pie/),
    })
  })

  it('rejects a cartesian chart with no numeric values', () => {
    const result = parseMarkdownChart(JSON.stringify({
      type: 'line',
      x: 'month',
      series: [
        { key: 'mrr', label: 'MRR' },
      ],
      data: [
        { month: 'Jan', mrr: null },
      ],
    }))

    expect(result).toMatchObject({
      error: expect.stringMatching(/data/),
    })
  })
})
