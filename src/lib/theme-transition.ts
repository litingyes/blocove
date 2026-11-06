// Circular reveal for light/dark switches, built on the browser View
// Transitions API (the same recipe the VitePress docs use). The theme write runs
// inside `document.startViewTransition`, then `::view-transition-old/new(root)`
// are uncovered with a clip-path circle growing from the control that was
// clicked out to the farthest viewport corner. Browsers without the API, and
// visitors who ask for reduced motion, get the immediate write the site shipped
// before: a theme change must never depend on the transition machinery.

export interface ThemeTransitionOrigin {
  x: number
  y: number
}

/** The pointer or keyboard activation a theme change can grow the reveal from. */
export interface ThemeTransitionEvent {
  clientX: number
  clientY: number
  currentTarget?: EventTarget | null
}

export interface ThemeTransitionOptions {
  /** Applies the new theme; runs inside the transition, or immediately. */
  update: () => void
  /** Where the reveal starts. Defaults to the centre of the viewport. */
  origin?: ThemeTransitionOrigin
  /** Whether the reveal uncovers the dark paint, rather than the light one. */
  dark?: boolean
}

const VIEW_TRANSITION_DURATION = 300
const VIEW_TRANSITION_EASING = 'ease-in'
// The old snapshot is on top and fades out by default. Animating the incoming
// snapshot for light, and the outgoing one for dark, keeps the revealed circle
// painted with the theme that is actually being switched to.
const OLD_ROOT_PSEUDO_ELEMENT = '::view-transition-old(root)'
const NEW_ROOT_PSEUDO_ELEMENT = '::view-transition-new(root)'

function viewportSize(): { width: number, height: number } {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 }
  }

  return { width: window.innerWidth, height: window.innerHeight }
}

function viewportCenter(): ThemeTransitionOrigin {
  const { width, height } = viewportSize()

  return { x: width / 2, y: height / 2 }
}

function isMeasurable(target: EventTarget | null | undefined): target is Element {
  return typeof target === 'object' && target !== null && 'getBoundingClientRect' in target
}

/** The radius that reaches the farthest corner, so the circle covers the page. */
function revealRadius(origin: ThemeTransitionOrigin): number {
  const { width, height } = viewportSize()

  return Math.hypot(
    Math.max(origin.x, width - origin.x),
    Math.max(origin.y, height - origin.y),
  )
}

function animateReveal(
  transition: ViewTransition,
  origin: ThemeTransitionOrigin | undefined,
  dark: boolean,
): void {
  const point = origin ?? viewportCenter()
  const collapsed = `circle(0px at ${point.x}px ${point.y}px)`
  const expanded = `circle(${revealRadius(point)}px at ${point.x}px ${point.y}px)`
  const clipPath = dark
    ? [expanded, collapsed]
    : [collapsed, expanded]

  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath },
        {
          duration: VIEW_TRANSITION_DURATION,
          easing: VIEW_TRANSITION_EASING,
          pseudoElement: dark ? OLD_ROOT_PSEUDO_ELEMENT : NEW_ROOT_PSEUDO_ELEMENT,
        },
      )
    })
    // A rejected `ready` means the transition was skipped; the theme itself was
    // already applied inside the callback, so there is nothing to recover.
    .catch(() => {})
  // `finished` rejects when a running transition is cut short (a second toggle,
  // a navigation). Swallow it so it never surfaces as an unhandled rejection.
  transition.finished.catch(() => {})
}

/**
 * Whether the visitor asked for reduced motion. A missing or throwing
 * `matchMedia` counts as reduced motion: animating is the risky choice.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return true
  }

  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  catch {
    // Embedded webviews can throw on matchMedia; fall back to no animation.
    return true
  }
}

/** Whether the browser ships the View Transitions API. */
export function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined' && typeof document.startViewTransition === 'function'
}

/**
 * The point a theme change should grow from. A pointer activation carries real
 * coordinates; keyboard activation synthesises a click at 0,0, so those events
 * fall back to the centre of the control that handled them. `undefined` means
 * "let the caller fall back to the centre of the viewport".
 */
export function originFromEvent(event: ThemeTransitionEvent): ThemeTransitionOrigin | undefined {
  if (event.clientX !== 0 || event.clientY !== 0) {
    return { x: event.clientX, y: event.clientY }
  }

  if (!isMeasurable(event.currentTarget)) {
    return undefined
  }

  const rect = event.currentTarget.getBoundingClientRect()

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

/**
 * Runs a theme write inside a view transition when the browser supports one,
 * and applies it immediately otherwise. The write always happens synchronously
 * inside `startViewTransition`, so a transition that never becomes ready can
 * never leave the page on the previous theme, and every failure of the
 * transition plumbing (API missing, reduced motion, throwing or partial
 * implementation, rejected promises) degrades to that same immediate write.
 */
export function runThemeTransition({ update, origin, dark = false }: ThemeTransitionOptions): void {
  if (!supportsViewTransitions() || prefersReducedMotion()) {
    update()
    return
  }

  try {
    const transition: ViewTransition | undefined = document.startViewTransition(() => update())

    if (!transition) {
      // A partial implementation (or a test double) returned nothing usable,
      // so the callback cannot be expected to run.
      update()
      return
    }

    animateReveal(transition, origin, dark)
  }
  catch {
    // Never let the reveal break the theme change: commit without it.
    update()
  }
}
