/* eslint-disable react/no-array-index-key -- parsed list items, table rows and cells are positional, so the index is the stable identity. */

import type { ReactNode } from 'react'
import type {
  MarkdownBlock,
  MarkdownCache,
  MarkdownComponents,
  MarkdownInline,
  MarkdownListBlock,
  MarkdownTableBlock,
} from '@/lib/blocove/markdown-parse'
import { cn } from 'cn'
import { Fragment, memo, useMemo, useRef, useState } from 'react'
import { extendMarkdown, parseMarkdown } from '@/lib/blocove/markdown-parse'

export type { MarkdownComponents }

export interface MarkdownProps {
  /** Markdown source. Growing the string incrementally is what the shell is built for. */
  source: string
  /** Mark the surface as still receiving tokens. */
  streaming?: boolean
  /** Apply the shadcn/typeset styles to the rendered nodes. */
  typeset?: boolean
  /** Optional renderers for the capability items, keyed by node family. */
  components?: MarkdownComponents
  className?: string
  /** Applied to the typeset element that holds the nodes. */
  contentClassName?: string
}

/**
 * Keeps the parse cache in state and re-parses only the open tail when the
 * source grows. The render-phase update mirrors `useHighlightedCode`: the cache
 * is derived from the props, so it is computed during render and committed
 * immediately.
 */
function useMarkdownBlocks(source: string): MarkdownCache {
  const [cache, setCache] = useState(() => parseMarkdown(source))

  if (cache.source !== source) {
    const next = extendMarkdown(cache, source)

    if (next !== cache) {
      setCache(next)
    }

    return next
  }

  return cache
}

/**
 * The `components` map is rebuilt by callers that pass an inline object. Blocks
 * are memoized on the map, so it is held stable until one of its entries does
 * change.
 */
function useStableComponents(components: MarkdownComponents | undefined): MarkdownComponents | undefined {
  const ref = useRef(components)

  if (ref.current?.code !== components?.code || ref.current?.math !== components?.math) {
    ref.current = components
  }

  return ref.current
}

function renderMath(
  value: string,
  display: boolean,
  components: MarkdownComponents | undefined,
  streaming: boolean,
  key: string,
): ReactNode {
  const MathRenderer = components?.math

  if (MathRenderer) {
    return <MathRenderer key={key} value={value} display={display} streaming={streaming} />
  }

  return (
    <code key={key}>
      {display
        ? `$$${value}$$`
        : `$${value}$`}
    </code>
  )
}

function renderInline(
  nodes: MarkdownInline[],
  components: MarkdownComponents | undefined,
  footnotes: ReadonlyMap<string, number>,
  streaming = false,
): ReactNode {
  return nodes.map((node, index) => {
    const key = `${node.kind}-${index}`

    switch (node.kind) {
      case 'text':
        return node.value
      case 'strong':
        return <strong key={key}>{renderInline(node.children, components, footnotes)}</strong>
      case 'emphasis':
        return <em key={key}>{renderInline(node.children, components, footnotes)}</em>
      case 'del':
        return <del key={key}>{renderInline(node.children, components, footnotes)}</del>
      case 'code':
        return <code key={key}>{node.value}</code>
      case 'link':
        return (
          <a key={key} href={node.href} title={node.title}>
            {renderInline(node.children, components, footnotes)}
          </a>
        )
      case 'image':
        return (
          <img
            key={key}
            src={node.src}
            alt={node.alt}
            title={node.title}
            loading="lazy"
            decoding="async"
          />
        )
      case 'math':
        return renderMath(node.value, false, components, streaming, key)
      case 'footnote-ref': {
        const number = footnotes.get(node.id)

        // A reference without a definition stays literal.
        return number === undefined
          ? `[^${node.id}]`
          : (
              <sup key={key}>
                <a href={`#fn-${node.id}`} id={`fnref-${node.id}`}>{number}</a>
              </sup>
            )
      }
      case 'break':
        return node.hard
          ? <br key={key} />
          : ' '
      default:
        return null
    }
  })
}

interface BlockViewProps {
  block: MarkdownBlock
  components?: MarkdownComponents
  footnotes: ReadonlyMap<string, number>
  streaming: boolean
}

/**
 * One parsed block. Memoized on the block object: the cache keeps finished
 * blocks by identity while the source grows, so a re-render of the shell does
 * not rebuild the subtree — a highlighted fence is not tokenized again and no
 * element remounts mid-stream.
 */
const MarkdownBlockView = memo(function MarkdownBlockView({
  block,
  components,
  footnotes,
  streaming,
}: BlockViewProps) {
  switch (block.kind) {
    case 'heading': {
      const Tag = `h${block.level}` as 'h1'
      return (
        <Tag data-streaming={streaming || undefined}>
          {renderInline(block.inline, components, footnotes)}
        </Tag>
      )
    }
    case 'paragraph':
      return (
        <p data-streaming={streaming || undefined}>
          {renderInline(block.inline, components, footnotes, streaming)}
        </p>
      )
    case 'rule':
      return <hr />
    case 'code': {
      const CodeRenderer = components?.code

      if (CodeRenderer) {
        return (
          <CodeRenderer
            language={block.language}
            code={block.code}
            streaming={streaming}
          />
        )
      }

      return (
        <pre data-streaming={streaming || undefined}>
          <code className={block.language
            ? `language-${block.language}`
            : undefined}
          >
            {block.code}
          </code>
        </pre>
      )
    }
    case 'blockquote':
      return (
        <blockquote data-streaming={streaming || undefined}>
          {block.children.map(child => (
            <MarkdownBlockView
              key={child.start}
              block={child}
              components={components}
              footnotes={footnotes}
              streaming={false}
            />
          ))}
        </blockquote>
      )
    case 'list':
      return (
        <MarkdownList
          block={block}
          components={components}
          footnotes={footnotes}
          streaming={streaming}
        />
      )
    case 'table':
      return (
        <MarkdownTable
          block={block}
          components={components}
          footnotes={footnotes}
          streaming={streaming}
        />
      )
    case 'math':
      return renderMath(block.value, true, components, streaming, `math-${block.start}`)
    case 'footnote':
      return null
  }
})

function MarkdownList({
  block,
  components,
  footnotes,
  streaming,
}: {
  block: MarkdownListBlock
  components?: MarkdownComponents
  footnotes: ReadonlyMap<string, number>
  streaming: boolean
}) {
  const Tag = block.ordered ? 'ol' : 'ul'
  const tasks = block.items.some(item => item.task !== null)

  return (
    <Tag
      start={block.ordered && block.startNumber !== 1
        ? block.startNumber
        : undefined}
      className={tasks ? 'contains-task-list' : undefined}
      data-streaming={streaming || undefined}
    >
      {block.items.map((item, index) => (
        <li
          key={index}
          className={item.task ? 'task-list-item' : undefined}
        >
          {item.task
            ? (
                <input
                  type="checkbox"
                  checked={item.task === 'checked'}
                  disabled
                  readOnly
                />
              )
            : null}
          {item.children.map((child) => {
            // A tight list renders the item paragraph without a wrapper.
            if (block.tight && child.kind === 'paragraph') {
              return (
                <Fragment key={child.start}>
                  {renderInline(child.inline, components, footnotes, streaming)}
                </Fragment>
              )
            }

            return (
              <MarkdownBlockView
                key={child.start}
                block={child}
                components={components}
                footnotes={footnotes}
                streaming={false}
              />
            )
          })}
        </li>
      ))}
    </Tag>
  )
}

function MarkdownTable({
  block,
  components,
  footnotes,
  streaming,
}: {
  block: MarkdownTableBlock
  components?: MarkdownComponents
  footnotes: ReadonlyMap<string, number>
  streaming: boolean
}) {
  return (
    <table data-streaming={streaming || undefined}>
      <thead>
        <tr>
          {block.header.map((cell, index) => (
            <th key={index} align={block.align[index] ?? undefined}>
              {renderInline(cell, components, footnotes)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {block.rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} align={block.align[cellIndex] ?? undefined}>
                {renderInline(cell, components, footnotes)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/**
 * Markdown renderer. Parses `source` into semantic elements inside a
 * shadcn/typeset container, so every node style comes from the typeset
 * stylesheet instead of a parallel one. The layout element carries `data-slot`;
 * the typeset element deliberately does not, because `.typeset [data-slot]` and
 * its descendants are excluded from the type styles.
 */
export function Markdown({
  source,
  streaming = false,
  typeset = true,
  components,
  className,
  contentClassName,
}: MarkdownProps) {
  const cache = useMarkdownBlocks(source)
  const blocks = cache.blocks
  const stableComponents = useStableComponents(components)

  // The numbering and the trailing section are derived state: they only change
  // when a definition appears, so the map keeps its identity while streaming.
  const footnoteKey = blocks
    .filter(block => block.kind === 'footnote')
    .map(block => block.kind === 'footnote'
      ? block.id
      : '')
    .join('\n')
  const footnotes = useMemo(() => {
    const numbers = new Map<string, number>()

    if (footnoteKey !== '') {
      for (const id of footnoteKey.split('\n')) {
        numbers.set(id, numbers.size + 1)
      }
    }

    return numbers
  }, [footnoteKey])

  const visible = blocks.filter(block => block.kind !== 'footnote')
  const definitions = blocks.filter(block => block.kind === 'footnote')
  const lastIndex = visible.length - 1

  return (
    <div data-slot="markdown" className={cn('w-full', className)}>
      <div
        className={cn(typeset && 'typeset typeset-docs', contentClassName)}
        data-streaming={streaming || undefined}
        aria-busy={streaming || undefined}
      >
        {visible.map((block, index) => (
          <MarkdownBlockView
            key={block.start}
            block={block}
            components={stableComponents}
            footnotes={footnotes}
            streaming={streaming && index === lastIndex}
          />
        ))}

        {definitions.length > 0
          ? (
              <section data-footnotes>
                <ol>
                  {definitions.map(block => (
                    <li key={block.start} id={`fn-${block.id}`}>
                      {renderInline(block.inline, stableComponents, footnotes)}
                    </li>
                  ))}
                </ol>
              </section>
            )
          : null}
      </div>
    </div>
  )
}
