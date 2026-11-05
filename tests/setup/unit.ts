import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { installDomStubs } from '../helpers/dom-stubs'

// React 19 only emits act warnings when this flag is set, and we run without
// vitest globals, so the cleanup has to be registered explicitly.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

installDomStubs()

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
