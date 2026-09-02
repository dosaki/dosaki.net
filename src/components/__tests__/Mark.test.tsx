import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Mark } from '../Mark'

describe('Mark', () => {
  it('renders an svg on the brand viewBox', () => {
    const { container } = render(<Mark />)
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 100 100')
  })

  it('inherits colour rather than hardcoding one', () => {
    const { container } = render(<Mark />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('fill', 'currentColor')
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/)
  })

  it('is hidden from assistive tech unless given a title', () => {
    const { container, rerender } = render(<Mark />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')

    rerender(<Mark title="Tiago Correia — home" />)
    expect(screen.getByRole('img', { name: 'Tiago Correia — home' })).toBeInTheDocument()
  })

  it('draws all three elements of the mark', () => {
    const { container } = render(<Mark />)
    expect(container.querySelectorAll('path')).toHaveLength(2) // gear, needle
    expect(container.querySelectorAll('circle')).toHaveLength(1) // inner ring
  })
})
