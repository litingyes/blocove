import type { DocsApiEntry } from '@/docs/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { apiId } from '@/lib/docs-anchor'

/**
 * API reference tables, one per exported component.
 */
export function ApiReference({ entries }: { entries: DocsApiEntry[] }) {
  return (
    <div className="flex flex-col gap-8">
      {entries.map((entry) => {
        const id = apiId(entry.name)

        return (
          <section key={entry.name} id={id} className="scroll-mt-24">
            <h3 className="text-base font-semibold">{entry.name}</h3>
            {entry.description
              ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {entry.description}
                  </p>
                )
              : null}
            {entry.extends
              ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Extends
                    {' '}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                      {entry.extends}
                    </code>
                    .
                  </p>
                )
              : null}

            {entry.rows.length > 0
              ? (
                  <div className="mt-3 overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Prop</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Default</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entry.rows.map(row => (
                          <TableRow key={row.prop}>
                            <TableCell>
                              <code className="font-mono text-xs">
                                {row.prop}
                              </code>
                            </TableCell>
                            <TableCell className="max-w-[28rem]">
                              <code className="font-mono text-xs break-words">
                                {row.type}
                              </code>
                            </TableCell>
                            <TableCell>
                              <code className="font-mono text-xs text-muted-foreground">
                                {row.default}
                              </code>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )
              : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    This component accepts no custom props.
                  </p>
                )}
          </section>
        )
      })}
    </div>
  )
}
