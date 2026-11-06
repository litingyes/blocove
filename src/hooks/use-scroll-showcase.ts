import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Tracks which of a set of stacked sections is crossing the middle of the
 * viewport, so a sticky panel next to them can follow the scroll. The band is
 * narrow (a tenth of the viewport) and hits the lowest index first, which keeps
 * the active section stable while two of them share the boundary.
 *
 * Environments without `IntersectionObserver` (the server render, tests without
 * a layout) keep the first section active.
 */
export function useScrollShowcase(count: number) {
  const [active, setActive] = useState(0)
  const nodes = useRef<Array<HTMLElement | null>>([])

  const sectionRefs = useMemo(
    () =>
      Array.from(
        { length: Math.max(count, 0) },
        (_, index) => (node: HTMLElement | null) => {
          nodes.current[index] = node
        },
      ),
    [count],
  )

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => nodes.current.indexOf(entry.target as HTMLElement))
          .filter(index => index >= 0)

        if (visible.length > 0) {
          setActive(Math.min(...visible))
        }
      },
      {
        rootMargin: '-45% 0px -45% 0px',
        threshold: 0,
      },
    )

    for (const node of nodes.current) {
      if (node) {
        observer.observe(node)
      }
    }

    return () => observer.disconnect()
  }, [sectionRefs])

  return { active, sectionRefs }
}
