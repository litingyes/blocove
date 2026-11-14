import { describe, expect, it } from 'vitest'
import {
  buildImageSrcSet,
  defaultImageWidths,
  focalPointPosition,
  identityImageTransform,
  normalizeImageWidths,
  placeholderBackground,
} from '@/lib/blocove/image-pipeline'

describe('identityImageTransform', () => {
  it('returns the source unchanged, whatever the width', () => {
    expect(identityImageTransform('/photo.jpg', 320)).toBe('/photo.jpg')
    expect(identityImageTransform('/photo.jpg', 960)).toBe('/photo.jpg')
  })
})

describe('normalizeImageWidths', () => {
  it('falls back to the default widths when none are given', () => {
    expect(normalizeImageWidths()).toEqual([...defaultImageWidths])
    expect(normalizeImageWidths([])).toEqual([...defaultImageWidths])
  })

  it('rounds, sorts and removes duplicates', () => {
    expect(normalizeImageWidths([640, 320, 640.4, 480])).toEqual([320, 480, 640])
  })

  it('drops widths that cannot produce an image', () => {
    expect(normalizeImageWidths([
      0,
      -320,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      320,
    ])).toEqual([320])
  })

  it('falls back when every width is invalid', () => {
    expect(normalizeImageWidths([0, -1])).toEqual([...defaultImageWidths])
  })
})

describe('buildImageSrcSet', () => {
  it('builds the default identity srcset from the default widths', () => {
    expect(buildImageSrcSet('/photo.jpg')).toBe(
      '/photo.jpg 320w, /photo.jpg 480w, /photo.jpg 640w, /photo.jpg 960w',
    )
  })

  it('applies the transform to every candidate', () => {
    const srcSet = buildImageSrcSet('/photo.jpg', {
      widths: [320, 640],
      transform: (src, width) => `${src}?w=${width}`,
    })

    expect(srcSet).toBe('/photo.jpg?w=320 320w, /photo.jpg?w=640 640w')
  })

  it('normalizes the widths it is given', () => {
    expect(buildImageSrcSet('/photo.jpg', {
      widths: [640, 640, 320],
    })).toBe(
      '/photo.jpg 320w, /photo.jpg 640w',
    )
  })
})

describe('focalPointPosition', () => {
  it('is undefined when no focal point is set', () => {
    expect(focalPointPosition()).toBeUndefined()
  })

  it('turns the point into an object-position value', () => {
    expect(focalPointPosition({ x: 25, y: 75 })).toBe('25% 75%')
    expect(focalPointPosition({ x: 0, y: 100 })).toBe('0% 100%')
  })
})

describe('placeholderBackground', () => {
  it('is empty when no placeholder is given', () => {
    expect(placeholderBackground()).toEqual({})
    expect(placeholderBackground('')).toEqual({})
  })

  it('uses an absolute path as a low-quality image', () => {
    expect(placeholderBackground('/lqip.jpg')).toEqual({
      backgroundImage: 'url("/lqip.jpg")',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
    })
  })

  it('uses an HTTP URL as a low-quality image', () => {
    expect(placeholderBackground('https://cdn.example.com/lqip.jpg')).toEqual({
      backgroundImage: 'url("https://cdn.example.com/lqip.jpg")',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
    })
  })

  it('uses a data URI as a low-quality image', () => {
    expect(placeholderBackground('data:image/jpeg;base64,AAAA')).toEqual({
      backgroundImage: 'url("data:image/jpeg;base64,AAAA")',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
    })
  })

  it('treats anything else as a CSS color', () => {
    expect(placeholderBackground('#eeeeee')).toEqual({ backgroundColor: '#eeeeee' })
    expect(placeholderBackground('var(--muted)')).toEqual({ backgroundColor: 'var(--muted)' })
  })
})
