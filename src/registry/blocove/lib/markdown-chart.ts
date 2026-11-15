export type MarkdownChartType = 'bar' | 'line' | 'area' | 'pie'

export interface MarkdownChartSeries {
  key: string
  label: string
}

export type MarkdownChartRow = Record<string, string | number | null>

export interface MarkdownChartSpec {
  type: MarkdownChartType
  title?: string
  /** Category key: the x axis for bar/line/area, the slice name for pie. */
  x: string
  /** Stacks bar and area series on one axis. Ignored by line and pie. */
  stacked?: boolean
  series: MarkdownChartSeries[]
  data: MarkdownChartRow[]
}

export type MarkdownChartParseResult
  = | { spec: MarkdownChartSpec }
    | { error: string }

const chartTypes: readonly MarkdownChartType[] = ['bar', 'line', 'area', 'pie']
const maxRows = 200
const maxPieSlices = 12
const maxSeries = 8
const maxTitle = 120
const maxLabel = 80

// The key is written into `--color-<key>`, so it has to be a CSS identifier.
const keyPattern = /^[A-Z][\w-]*$/i

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function fail(error: string): MarkdownChartParseResult {
  return { error }
}

/**
 * Parses the body of a `chart` fence: one JSON object with a small schema.
 *
 * ```json
 * {
 *   "type": "bar",
 *   "title": "MRR by month",
 *   "x": "month",
 *   "series": [{ "key": "mrr", "label": "MRR" }],
 *   "data": [{ "month": "Jan", "mrr": 120 }]
 * }
 * ```
 *
 * The renderer keeps the source visible until the fence is complete and the spec
 * validates, so a partially streamed spec or a model mistake is never lost.
 */
export function parseMarkdownChart(source: string): MarkdownChartParseResult {
  let value: unknown

  try {
    value = JSON.parse(source)
  }
  catch {
    return fail('The chart spec is not valid JSON.')
  }

  if (!isPlainObject(value)) {
    return fail('The chart spec must be a JSON object.')
  }

  const { type, title, x, stacked, series, data } = value

  if (typeof type !== 'string' || !chartTypes.includes(type as MarkdownChartType)) {
    return fail('"type" must be "bar", "line", "area" or "pie".')
  }

  if (title !== undefined && (typeof title !== 'string' || title.length > maxTitle)) {
    return fail('"title" must be a string of at most 120 characters.')
  }

  if (typeof x !== 'string' || x.trim() === '') {
    return fail('"x" must be a non-empty string.')
  }

  if (
    !Array.isArray(data)
    || data.length < 1
    || data.length > maxRows
    || !data.every(isPlainObject)
  ) {
    return fail('"data" must contain 1–200 rows.')
  }

  const rows = data as MarkdownChartRow[]

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]

    if (!Object.hasOwn(row, x)) {
      return fail(`data[${index}].${x} is missing.`)
    }

    const cell = row[x]

    if (typeof cell !== 'string' && !isFiniteNumber(cell)) {
      return fail(`data[${index}].${x} must be a string or a finite number.`)
    }
  }

  if (
    !Array.isArray(series)
    || series.length < 1
    || series.length > maxSeries
    || !series.every(isPlainObject)
  ) {
    return fail('"series" must contain 1–8 entries.')
  }

  const normalizedSeries: MarkdownChartSeries[] = []
  const keys = new Set<string>()

  for (let index = 0; index < series.length; index++) {
    const entry = series[index]
    const key = entry.key

    if (typeof key !== 'string' || !keyPattern.test(key)) {
      return fail(`series[${index}].key must match [A-Za-z][A-Za-z0-9_-]*.`)
    }

    if (keys.has(key)) {
      return fail(`series[${index}].key is duplicated.`)
    }

    keys.add(key)

    const label = entry.label

    if (typeof label !== 'string' || label.trim() === '' || label.length > maxLabel) {
      return fail(`series[${index}].label must be a non-empty string of at most 80 characters.`)
    }

    normalizedSeries.push({ key, label })
  }

  if (stacked !== undefined && typeof stacked !== 'boolean') {
    return fail('"stacked" must be a boolean.')
  }

  if (type === 'pie') {
    if (normalizedSeries.length !== 1) {
      return fail('A pie chart needs exactly one series.')
    }

    if (rows.length > maxPieSlices) {
      return fail('A pie chart needs 1–12 slices.')
    }

    const key = normalizedSeries[0].key
    const names = new Set<string>()

    for (let index = 0; index < rows.length; index++) {
      const cell = rows[index][key]

      if (!isFiniteNumber(cell) || cell < 0) {
        return fail(`data[${index}].${key} must be a non-negative number for a pie chart.`)
      }

      const name = String(rows[index][x])

      if (names.has(name)) {
        return fail(`data[${index}].${x} is duplicated.`)
      }

      names.add(name)
    }
  }
  else {
    let numeric = false

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index]

      for (const entry of normalizedSeries) {
        const cell = row[entry.key]

        if (cell === null) {
          continue
        }

        if (!isFiniteNumber(cell)) {
          return fail(`data[${index}].${entry.key} must be a finite number or null.`)
        }

        numeric = true
      }
    }

    if (!numeric) {
      return fail('"data" has no numeric values.')
    }
  }

  const spec: MarkdownChartSpec = {
    type: type as MarkdownChartType,
    x,
    series: normalizedSeries,
    data: rows,
  }

  if (title !== undefined) {
    spec.title = title
  }

  if (stacked !== undefined) {
    spec.stacked = stacked
  }

  return { spec }
}
