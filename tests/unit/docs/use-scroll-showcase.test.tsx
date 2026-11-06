import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useScrollShowcase } from '@/hooks/use-scroll-showcase'

const steps = ['rich-text-editor', 'code-editor', 'media'] as const

interface FakeEntry {
  target: Element
  isIntersecting?: boolean
}

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = []

  readonly observed: Element[] = []
  disconnected = false
  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    FakeIntersectionObserver.instances.push(this)
  }

  observe(target: Element) {
    this.observed.push(target)
  }

  unobserve() {}

  disconnect() {
    this.disconnected = true
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }

  emit(entries: FakeEntry[]) {
    this.callback(
      entries.map(entry => ({
        isIntersecting: entry.isIntersecting ?? true,
        target: entry.target,
      }) as IntersectionObserverEntry),
      this as unknown as IntersectionObserver,
    )
  }
}

function Host() {
  const { active, sectionRefs } = useScrollShowcase(steps.length)

  return (
    <div>
      <output data-testid="active">{active}</output>
      {steps.map((step, index) => (
        <section key={step} ref={sectionRefs[index]} />
      ))}
    </div>
  )
}

function setup() {
  FakeIntersectionObserver.instances = []
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)

  const rendered = render(<Host />)
  const observer = FakeIntersectionObserver.instances[0]

  if (!observer) {
    throw new Error('useScrollShowcase created no observer')
  }

  return { ...rendered, observer }
}

beforeEach(() => {
  FakeIntersectionObserver.instances = []
})

describe('useScrollShowcase', () => {
  it('observes every step and starts on the first', () => {
    const { getByTestId, observer } = setup()

    expect(observer.observed).toHaveLength(steps.length)
    expect(getByTestId('active').textContent).toBe('0')
  })

  it('follows the step that crosses the middle of the viewport', () => {
    const { container, getByTestId, observer } = setup()
    const sections = container.querySelectorAll('section')

    act(() => observer.emit([
      { target: sections[2] },
    ]))

    expect(getByTestId('active').textContent).toBe('2')
  })

  it('keeps the earliest step when two of them cross the band', () => {
    const { container, getByTestId, observer } = setup()
    const sections = container.querySelectorAll('section')

    act(() => observer.emit([
      { target: sections[2] },
      { target: sections[1] },
    ]))

    expect(getByTestId('active').textContent).toBe('1')
  })

  it('ignores sections that are leaving the band', () => {
    const { container, getByTestId, observer } = setup()
    const sections = container.querySelectorAll('section')

    act(() => observer.emit([
      { target: sections[2], isIntersecting: false },
      { target: sections[0], isIntersecting: false },
    ]))

    expect(getByTestId('active').textContent).toBe('0')
  })

  it('disconnects the observer on unmount', () => {
    const { observer, unmount } = setup()

    unmount()

    expect(observer.disconnected).toBe(true)
  })

  it('keeps the first step active without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined)

    const { getByTestId } = render(<Host />)

    expect(getByTestId('active').textContent).toBe('0')
    expect(FakeIntersectionObserver.instances).toHaveLength(0)
  })
})
