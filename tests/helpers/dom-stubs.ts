import { vi } from 'vitest'

// happy-dom implements a lot of the DOM, but it does not do layout. ProseMirror
// and CodeMirror measure the document through ranges and rects, and base-ui uses
// observers and pointer events for its popups. These shims only fill in APIs that
// are missing: anything happy-dom already provides is left untouched, and no
// geometry is faked beyond empty rects. Behaviour that depends on real layout is
// covered by the browser project instead.

let installed = false

function stubValue(target: object, key: string, value: unknown) {
  if (key in target) {
    return
  }

  Object.defineProperty(target, key, {
    configurable: true,
    writable: true,
    value,
  })
}

function createRect(): DOMRect {
  const rect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    toJSON: () => rect,
  }

  return rect as DOMRect
}

function createRectList(): DOMRectList {
  const list = [] as unknown as DOMRectList

  return Object.assign(list, {
    item: () => null,
  })
}

function createMediaQueryList(query: string): MediaQueryList {
  const listeners = new Set<(event: MediaQueryListEvent) => void>()

  const queryList = {
    matches: false,
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener)
    },
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener)
    },
    addListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener)
    },
    removeListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener)
    },
    dispatchEvent: () => true,
  }

  return queryList as unknown as MediaQueryList
}

function createObserver() {
  return class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
}

export function installDomStubs() {
  if (installed) {
    return
  }

  installed = true

  const globalScope = globalThis as typeof globalThis & {
    ResizeObserver?: unknown
    IntersectionObserver?: unknown
    PointerEvent?: unknown
  }

  stubValue(globalScope, 'ResizeObserver', createObserver())
  stubValue(globalScope, 'IntersectionObserver', createObserver())

  if (typeof window !== 'undefined') {
    stubValue(window, 'matchMedia', (query: string) => createMediaQueryList(query))
  }

  const rangePrototype = Range.prototype as Range & {
    getClientRects?: () => DOMRectList
    getBoundingClientRect?: () => DOMRect
  }

  stubValue(rangePrototype, 'getClientRects', createRectList)
  stubValue(rangePrototype, 'getBoundingClientRect', createRect)

  const elementPrototype = Element.prototype as Element & {
    getClientRects?: () => DOMRectList
    scrollIntoView?: () => void
  }

  stubValue(elementPrototype, 'getClientRects', createRectList)
  stubValue(elementPrototype, 'scrollIntoView', () => {})

  if (typeof document !== 'undefined') {
    stubValue(document, 'elementFromPoint', () => null)
  }

  if (typeof navigator !== 'undefined') {
    stubValue(navigator, 'clipboard', {
      writeText: vi.fn(async () => {}),
      readText: vi.fn(async () => ''),
      write: vi.fn(async () => {}),
      read: vi.fn(async () => []),
    })
  }

  if (typeof globalScope.PointerEvent !== 'function') {
    class PointerEventShim extends MouseEvent {
      pointerId = 1
      width = 0
      height = 0
      pressure = 0
      tangentialPressure = 0
      tiltX = 0
      tiltY = 0
      twist = 0
      pointerType = 'mouse'
      isPrimary = true
    }

    stubValue(globalScope, 'PointerEvent', PointerEventShim)
  }
}
