import { useEffect, useState } from 'react'

/**
 * Tracks the section currently in view for the "On This Page" navigation.
 */
export function useActiveSection(ids: string[]) {
  const key = ids.join('|')
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    const elements = key
      .split('|')
      .filter(Boolean)
      .map(id => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)

    if (elements.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible[0]) {
          setActive(visible[0].target.id)
        }
      },
      {
        rootMargin: '-96px 0px -65% 0px',
        threshold: [0, 1],
      },
    )

    for (const element of elements) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [key])

  return active
}
