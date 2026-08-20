import '@testing-library/jest-dom'
import { vi } from 'vitest'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!('ResizeObserver' in window)) {
  window.ResizeObserver = ResizeObserverMock
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn()
}

if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = vi.fn(() => 'blob:mock')
}
if (!window.URL.revokeObjectURL) {
  window.URL.revokeObjectURL = vi.fn()
}
