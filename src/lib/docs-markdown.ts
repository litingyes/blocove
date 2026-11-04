import type { DocsApiRow, DocsPageData } from '@/docs/types'
import type { RegistryItem } from '@/lib/registry-catalog'
import { addCommand, itemAddress, namespaceAddress } from './docs-commands'

function codeBlock(code: string, language = 'tsx') {
  return `\`\`\`${language}\n${code.replace(/\n$/, '')}\n\`\`\``
}

function apiTable(rows: DocsApiRow[]) {
  const header = '| Prop | Type | Default |\n| --- | --- | --- |'
  const body = rows
    .map(row => `| \`${row.prop}\` | \`${row.type}\` | ${row.default === '-'
      ? '-'
      : `\`${row.default}\``} |`)
    .join('\n')

  return `${header}\n${body}`
}

/**
 * A copyable markdown representation of a docs page, used by the Copy Page
 * action.
 */
export function buildPageMarkdown(item: RegistryItem, data?: DocsPageData) {
  const lines: string[] = [
    `# ${item.title}`,
    '',
    item.description,
    '',
  ]

  lines.push('## Installation', '', codeBlock(addCommand('npm', itemAddress(item.name)), 'bash'), '')

  if (data?.requiresTypeset) {
    lines.push(
      '> Typography requires [shadcn/typeset](https://ui.shadcn.com/docs/typeset). Copy `typeset.css` next to your main stylesheet, import it after Tailwind and add the `.typeset-docs` preset.',
      '',
    )
  }

  if (data?.demoDeps?.length) {
    lines.push(
      `This example also uses: ${data.demoDeps.map(name => `\`${name}\``).join(', ')}.`,
      '',
      codeBlock(
        addCommand(
          'npm',
          data.demoDeps.map(name => itemAddress(name)).join(' '),
        ),
        'bash',
      ),
      '',
    )
  }

  if (data?.note) {
    lines.push(data.note, '')
  }

  if (data?.usage?.length) {
    lines.push('## Usage', '')

    for (const snippet of data.usage) {
      if (snippet.title) {
        lines.push(`### ${snippet.title}`, '')
      }

      lines.push(codeBlock(snippet.code, snippet.language ?? 'tsx'), '')
    }
  }

  if (data?.api?.length) {
    lines.push('## API Reference', '')

    for (const entry of data.api) {
      lines.push(`### ${entry.name}`, '')

      if (entry.description) {
        lines.push(entry.description, '')
      }

      if (entry.extends) {
        lines.push(`Extends \`${entry.extends}\`.`, '')
      }

      if (entry.rows.length > 0) {
        lines.push(apiTable(entry.rows), '')
      }
    }
  }

  if (item.registryDependencies.length > 0) {
    lines.push(
      '## Registry dependencies',
      '',
      item.registryDependencies.map(dependency => `- \`${dependency}\``).join('\n'),
      '',
    )
  }

  lines.push(`Namespace: \`${addCommand('npm', namespaceAddress(item.name))}\``, '')

  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`
}
