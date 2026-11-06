import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  originFromEvent,
  prefersReducedMotion,
  runThemeTransition,
  supportsViewTransitions,
} from '@/lib/theme-transition'

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

interface ViewTransitionStubOptions {
  ready?: Promise<void>
  finished?: Promise<void>
  invokeUpdate?: boolean
}

/**
 * `document.startViewTransition` only exists in a real browser, so the unit
 * suite installs its own controllable stand-in: happy-dom must stay on the
 * fallback path by default, exactly like the browsers the site supports today.
 */
function stubViewTransitions(options: ViewTransitionStubOptions = {}) {
  const startViewTransition = vi.fn((callback: () => void) => {
    if (options.invokeUpdate ?? true) {
      callback()
    }

    return {
      ready: options.ready ?? Promise.resolve(),
      finished: options.finished ?? Promise.resolve(),
    } as unknown as ViewTransition
  })

  Object.defineProperty(document, 'startViewTransition', {
    configurable: true,
    writable: true,
    value: startViewTransition,
  })

  return startViewTransition
}

function stubAnimate() {
  return vi.spyOn(document.documentElement, 'animate').mockReturnValue({} as Animation)
}

let restoreViewport: (() => void) | undefined

function stubViewport(width: number, height: number) {
  const widthDescriptor = Object.getOwnPropertyDescriptor(window, 'innerWidth')
  const heightDescriptor = Object.getOwnPropertyDescriptor(window, 'innerHeight')

  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    writable: true,
    value: height,
  })

  restoreViewport = () => {
    if (widthDescriptor) {
      Object.defineProperty(window, 'innerWidth', widthDescriptor)
    }
    else {
      Reflect.deleteProperty(window, 'innerWidth')
    }

    if (heightDescriptor) {
      Object.defineProperty(window, 'innerHeight', heightDescriptor)
    }
    else {
      Reflect.deleteProperty(window, 'innerHeight')
    }
  }
}

function stubReducedMotion(matches: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
    matches: query === reducedMotionQuery
      ? matches
      : false,
    media: query,
  } as MediaQueryList))
}

/** The animation starts from `transition.ready`, which settles one tick later. */
async function flushTransition() {
  await Promise.resolve()
  await Promise.resolve()
}

afterEach(() => {
  restoreViewport?.()
  restoreViewport = undefined
  Reflect.deleteProperty(document, 'startViewTransition')
})

describe('view transition capability', () => {
  it('reports the API as missing until the browser provides it', () => {
    expect(supportsViewTransitions()).toBe(false)

    stubViewTransitions()

    expect(supportsViewTransitions()).toBe(true)
  })

  it('follows the reduced-motion media query', () => {
    expect(prefersReducedMotion()).toBe(false)

    stubReducedMotion(true)

    expect(prefersReducedMotion()).toBe(true)
  })

  it('asks for no animation when matchMedia is missing or throws', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(prefersReducedMotion()).toBe(true)
  })
})

describe('originFromEvent', () => {
  function elementWithRect(rect: Partial<DOMRect>): HTMLElement {
    const element = document.createElement('button')

    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      toJSON: () => ({}),
      ...rect,
    } as DOMRect)

    return element
  }

  it('prefers the pointer coordinates', () => {
    const currentTarget = elementWithRect({
      top: 100,
      left: 100,
      width: 40,
      height: 40,
    })

    expect(originFromEvent({ clientX: 12, clientY: 34, currentTarget })).toEqual({
      x: 12,
      y: 34,
    })
  })

  it('uses the centre of the control for keyboard activation', () => {
    // Keyboard activation synthesises a click at 0,0, not on the control.
    const currentTarget = elementWithRect({
      top: 20,
      left: 10,
      width: 40,
      height: 20,
    })

    expect(originFromEvent({ clientX: 0, clientY: 0, currentTarget })).toEqual({
      x: 30,
      y: 30,
    })
  })

  it('returns nothing when there is no element to measure', () => {
    expect(originFromEvent({ clientX: 0, clientY: 0 })).toBeUndefined()
    expect(originFromEvent({ clientX: 0, clientY: 0, currentTarget: null })).toBeUndefined()
    expect(originFromEvent({
      clientX: 0,
      clientY: 0,
      currentTarget: new EventTarget(),
    })).toBeUndefined()
  })
})

describe('runThemeTransition', () => {
  it('applies the update immediately when the API is missing', () => {
    const update = vi.fn()

    expect(() => runThemeTransition({ update })).not.toThrow()
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('applies the update immediately when motion is reduced', () => {
    const startViewTransition = stubViewTransitions()

    stubReducedMotion(true)

    const update = vi.fn()

    runThemeTransition({ update })

    expect(startViewTransition).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('falls back synchronously when startViewTransition throws', () => {
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      writable: true,
      value: () => {
        throw new Error('transition unavailable')
      },
    })

    const update = vi.fn()

    expect(() => runThemeTransition({ update })).not.toThrow()
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('commits when the implementation returns nothing usable', () => {
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      writable: true,
      value: vi.fn(() => undefined),
    })

    const update = vi.fn()

    expect(() => runThemeTransition({ update })).not.toThrow()
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('runs the theme write inside the transition callback', () => {
    const startViewTransition = stubViewTransitions()
    const update = vi.fn()

    runThemeTransition({ update })

    expect(startViewTransition).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledTimes(1)
    expect(startViewTransition.mock.calls[0][0]).toBeInstanceOf(Function)
  })

  it('reveals the incoming light paint with the default viewport centre', async () => {
    stubViewport(600, 800)

    const animate = stubAnimate()

    stubViewTransitions()

    runThemeTransition({
      update: vi.fn(),
    })

    expect(animate).not.toHaveBeenCalled()

    await flushTransition()

    expect(animate).toHaveBeenCalledTimes(1)
    expect(animate).toHaveBeenCalledWith(
      {
        clipPath: [
          'circle(0px at 300px 400px)',
          'circle(500px at 300px 400px)',
        ],
      },
      {
        duration: 300,
        easing: 'ease-in',
        pseudoElement: '::view-transition-new(root)',
      },
    )
  })

  it('grows the circle out to the farthest corner', async () => {
    stubViewport(600, 800)

    const animate = stubAnimate()

    stubViewTransitions()

    runThemeTransition({
      update: vi.fn(),
      origin: { x: 0, y: 0 },
    })

    await flushTransition()

    expect(animate).toHaveBeenCalledWith(
      {
        clipPath: [
          'circle(0px at 0px 0px)',
          'circle(1000px at 0px 0px)',
        ],
      },
      expect.objectContaining({ pseudoElement: '::view-transition-new(root)' }),
    )
  })

  it('reverses the reveal and animates the outgoing paint in dark mode', async () => {
    stubViewport(600, 800)

    const animate = stubAnimate()

    stubViewTransitions()

    runThemeTransition({
      update: vi.fn(),
      dark: true,
    })

    await flushTransition()

    expect(animate).toHaveBeenCalledWith(
      {
        clipPath: [
          'circle(500px at 300px 400px)',
          'circle(0px at 300px 400px)',
        ],
      },
      {
        duration: 300,
        easing: 'ease-in',
        pseudoElement: '::view-transition-old(root)',
      },
    )
  })

  it('swallows rejected ready and finished promises', async () => {
    const animate = stubAnimate()

    stubViewTransitions({
      ready: Promise.reject(new Error('ready rejected')),
      finished: Promise.reject(new Error('finished rejected')),
    })

    const update = vi.fn()

    expect(() => runThemeTransition({ update })).not.toThrow()

    await flushTransition()

    expect(update).toHaveBeenCalledTimes(1)
    expect(animate).not.toHaveBeenCalled()
  })

  it('still applies the theme when the animation cannot start', async () => {
    stubViewTransitions()

    const update = vi.fn()
    const animate = vi
      .spyOn(document.documentElement, 'animate')
      .mockImplementation(() => {
        throw new Error('animation unavailable')
      })

    runThemeTransition({ update })

    await flushTransition()

    expect(update).toHaveBeenCalledTimes(1)
    expect(animate).toHaveBeenCalledTimes(1)
  })
})
