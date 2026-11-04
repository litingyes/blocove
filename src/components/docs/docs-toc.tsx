import { cn } from 'cn'
import { useActiveSection } from '@/lib/use-active-section'

export interface TocItem {
  id: string
  label: string
}

/**
 * Sticky "On This Page" navigation with scroll tracking.
 */
export function DocsToc({ items }: { items: TocItem[] }) {
  const active = useActiveSection(items.map(item => item.id))

  return (
    <nav
      aria-label="On this page"
      className="sticky top-20 hidden self-start xl:block"
    >
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        On This Page
      </p>
      <ul className="mt-3 flex flex-col gap-2 border-l">
        {items.map(item => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                '-ml-px block border-l border-transparent pl-3 text-sm text-muted-foreground transition-colors hover:text-foreground',
                active === item.id && 'border-foreground font-medium text-foreground',
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
