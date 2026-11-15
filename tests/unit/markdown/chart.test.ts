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

  it('rejects a spec that is not a JSON object', () => {
    expect(parseMarkdownChart('[]')).toMatchObject({
      error: expect.stringMatching(/object/),
    })
  })

  it('rejects a non-string type value', () => {
    expect(parseMarkdownChart(JSON.stringify({
      type: 42,
      x: 'month',
      series: [
        { key: 'a', label: 'A' },
      ],
      data: [
        { month: 'Jan', a: 1 },
      ],
    })))
      .toMatchObject({
        error: expect.stringMatching(/type/),
      })
  })

  it('rejects a non-string title and an over-long title', () => {
    const base = {
      type: 'bar',
      x: 'month',
      series: [
        { key: 'a', label: 'A' },
      ],
      data: [
        { month: 'Jan', a: 1 },
      ],
    }

    expect(parseMarkdownChart(JSON.stringify({ ...base, title: 42 })))
      .toMatchObject({
        error: expect.stringMatching(/title/),
      })
    expect(parseMarkdownChart(JSON.stringify({
      ...base,
      title: 'x'.repeat(121),
    })))
      .toMatchObject({
        error: expect.stringMatching(/title/),
      })
  })

  it('rejects a missing or empty category key', () => {
    const base = {
      type: 'bar',
      series: [
        { key: 'a', label: 'A' },
      ],
      data: [
        { month: 'Jan', a: 1 },
      ],
    }

    expect(parseMarkdownChart(JSON.stringify(base)))
      .toMatchObject({
        error: expect.stringMatching(/"x"/),
      })
    expect(parseMarkdownChart(JSON.stringify({ ...base, x: '  ' })))
      .toMatchObject({
        error: expect.stringMatching(/"x"/),
      })
  })

  it('rejects invalid data shapes', () => {
    const base = {
      type: 'bar',
      x: 'month',
      series: [
        { key: 'a', label: 'A' },
      ],
    }

    expect(parseMarkdownChart(JSON.stringify({ ...base, data: {} })))
      .toMatchObject({
        error: expect.stringMatching(/"data"/),
      })
    expect(parseMarkdownChart(JSON.stringify({ ...base, data: [] })))
      .toMatchObject({
        error: expect.stringMatching(/"data"/),
      })
    expect(parseMarkdownChart(JSON.stringify({
      ...base,
      data: [1],
    })))
      .toMatchObject({
        error: expect.stringMatching(/"data"/),
      })
    expect(parseMarkdownChart(JSON.stringify({
      ...base,
      data: Array.from({ length: 201 }, (_, index) => ({ month: `m${index}`, a: 1 })),
    })))
      .toMatchObject({
        error: expect.stringMatching(/"data"/),
      })
  })

  it('rejects a row without the category or with a bad category', () => {
    const base = {
      type: 'bar',
      x: 'month',
      series: [
        { key: 'a', label: 'A' },
      ],
    }

    expect(parseMarkdownChart(JSON.stringify({
      ...base,
      data: [
        { a: 1 },
      ],
    })))
      .toMatchObject({
        error: expect.stringMatching(/data\[0\]\.month/),
      })
    expect(parseMarkdownChart(JSON.stringify({
      ...base,
      data: [
        { month: null, a: 1 },
      ],
    })))
      .toMatchObject({
        error: expect.stringMatching(/data\[0\]\.month/),
      })
  })

  it('rejects invalid series shapes and keys', () => {
    const base = {
      type: 'bar',
      x: 'month',
      data: [
        { month: 'Jan', a: 1 },
      ],
    }

    expect(parseMarkdownChart(JSON.stringify({ ...base, series: {} })))
      .toMatchObject({
        error: expect.stringMatching(/"series"/),
      })
    expect(parseMarkdownChart(JSON.stringify({
      ...base,
      series: [1],
    })))
      .toMatchObject({
        error: expect.stringMatching(/"series"/),
      })
    expect(parseMarkdownChart(JSON.stringify({
      ...base,
      series: Array.from({ length: 9 }, (_, index) => ({ key: `k${index}`, label: 'K' })),
    })))
      .toMatchObject({
        error: expect.stringMatching(/"series"/),
      })
    expect(parseMarkdownChart(JSON.stringify({
      ...base,
      series: [
        { key: 42, label: 'A' },
      ],
    })))
      .toMatchObject({
        error: expect.stringMatching(/series\[0\]\.key/),
      })
    expect(parseMarkdownChart(JSON.stringify({
      ...base,
      series: [
        { key: 'a', label: 'A' },
        { key: 'a', label: 'B' },
      ],
    })))
      .toMatchObject({
        error: expect.stringMatching(/duplicated/),
      })
  })

  it('rejects an empty or over-long series label', () => {
    const base = {
      type: 'bar',
      x: 'month',
      data: [
        { month: 'Jan', a: 1 },
      ],
    }

    expect(parseMarkdownChart(JSON.stringify({
      ...base,
      series: [
        { key: 'a', label: ' ' },
      ],
    })))
      .toMatchObject({
        error: expect.stringMatching(/label/),
      })
    expect(parseMarkdownChart(JSON.stringify({
      ...base,
      series: [
        {
          key: 'a',
          label: 'x'.repeat(81),
        },
      ],
    })))
      .toMatchObject({
        error: expect.stringMatching(/label/),
      })
  })

  it('rejects a non-boolean stacked flag and accepts a stacked chart', () => {
    const base = {
      type: 'bar',
      x: 'month',
      series: [
        { key: 'a', label: 'A' },
      ],
      data: [
        { month: 'Jan', a: 1 },
      ],
    }

    expect(parseMarkdownChart(JSON.stringify({ ...base, stacked: 'yes' })))
      .toMatchObject({
        error: expect.stringMatching(/stacked/),
      })
    expect(parseMarkdownChart(JSON.stringify({ ...base, stacked: true })))
      .toMatchObject({
        spec: { stacked: true },
      })
  })

  it('rejects a pie that is too large, negative or duplicated', () => {
    const base = {
      type: 'pie',
      x: 'country',
      series: [
        { key: 'share', label: 'Share' },
      ],
    }

    expect(parseMarkdownChart(JSON.stringify({
      ...base,
      data: Array.from({ length: 13 }, (_, index) => ({ country: `c${index}`, share: 1 })),
    })))
      .toMatchObject({
        error: expect.stringMatching(/pie/),
      })
    expect(parseMarkdownChart(JSON.stringify({
      ...base,
      data: [
        { country: 'x', share: -1 },
      ],
    })))
      .toMatchObject({
        error: expect.stringMatching(/pie/),
      })
    expect(parseMarkdownChart(JSON.stringify({
      ...base,
      data: [
        { country: 'x', share: 1 },
        { country: 'x', share: 2 },
      ],
    })))
      .toMatchObject({
        error: expect.stringMatching(/duplicated/),
      })
  })

  it('rejects a missing series value', () => {
    const result = parseMarkdownChart(JSON.stringify({
      type: 'line',
      x: 'month',
      series: [
        { key: 'mrr', label: 'MRR' },
      ],
      data: [
        { month: 'Jan' },
      ],
    }))

    expect(result).toMatchObject({
      error: expect.stringMatching(/data\[0\]\.mrr/),
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
