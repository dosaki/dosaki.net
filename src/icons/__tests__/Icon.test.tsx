import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Icon } from '../Icon'
import { ICON_PATHS } from '../paths.generated'

describe('Icon', () => {
  it('renders an svg with the path for the named icon', () => {
    const { container } = render(<Icon name="linkedin" />)
    const path = container.querySelector('path')
    expect(path?.getAttribute('d')).toBe(ICON_PATHS.linkedin.d)
  })

  it('uses the icon-specific viewBox', () => {
    const { container } = render(<Icon name="workshop" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('viewBox')).toBe(
      `0 0 ${ICON_PATHS.workshop.w} ${ICON_PATHS.workshop.h}`,
    )
  })

  it('is hidden from assistive tech unless given a title', () => {
    const { container, rerender } = render(<Icon name="envelope" />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')

    rerender(<Icon name="envelope" title="Email" />)
    expect(screen.getByRole('img', { name: 'Email' })).toBeInTheDocument()
  })
})
