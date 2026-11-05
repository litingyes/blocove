import { describe, expect, it } from 'vitest'
import { mediaAspectRatioStyle, mediaThemeStyle } from '@/lib/blocove/media-theme'

describe('mediaAspectRatioStyle', () => {
  it('maps every named ratio to a CSS value', () => {
    expect(mediaAspectRatioStyle('video')).toEqual({ aspectRatio: '16 / 9' })
    expect(mediaAspectRatioStyle('classic')).toEqual({ aspectRatio: '4 / 3' })
    expect(mediaAspectRatioStyle('square')).toEqual({ aspectRatio: '1 / 1' })
    expect(mediaAspectRatioStyle('portrait')).toEqual({ aspectRatio: '9 / 16' })
    expect(mediaAspectRatioStyle('wide')).toEqual({ aspectRatio: '21 / 9' })
  })

  it('defaults to the video ratio', () => {
    expect(mediaAspectRatioStyle()).toEqual({ aspectRatio: '16 / 9' })
  })

  it('leaves auto without a ratio', () => {
    expect(mediaAspectRatioStyle('auto')).toBeUndefined()
  })
})

describe('mediaThemeStyle', () => {
  it('maps the shadcn tokens by default', () => {
    expect(mediaThemeStyle()).toEqual({
      '--media-border-radius': 'var(--radius, 0.625rem)',
      '--media-border-color': 'var(--border, transparent)',
      '--media-font-family': 'var(--font-sans, inherit)',
      '--media-scale-unit': '1rem',
    })
  })

  it('only emits the accent when it is passed', () => {
    expect(mediaThemeStyle()).not.toHaveProperty('--media-accent-color')
    expect(mediaThemeStyle({ accentColor: '#f5c518' })).toMatchObject({
      '--media-accent-color': '#f5c518',
    })
  })

  it('forwards every supported setting', () => {
    expect(mediaThemeStyle({
      accentColor: '#f5c518',
      accentTextColor: 'black',
      borderColor: 'transparent',
      borderRadius: '1rem',
      fontFamily: 'Roboto, sans-serif',
      objectFit: 'cover',
      objectPosition: 'top left',
      scaleUnit: '0.875rem',
    })).toEqual({
      '--media-accent-color': '#f5c518',
      '--media-accent-text-color': 'black',
      '--media-border-color': 'transparent',
      '--media-border-radius': '1rem',
      '--media-font-family': 'Roboto, sans-serif',
      '--media-object-fit': 'cover',
      '--media-object-position': 'top left',
      '--media-scale-unit': '0.875rem',
    })
  })

  it('keeps the defaults when an option is undefined', () => {
    expect(mediaThemeStyle({ accentColor: undefined })).not.toHaveProperty('--media-accent-color')
    expect(mediaThemeStyle({})).toHaveProperty('--media-scale-unit', '1rem')
  })
})
