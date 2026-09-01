import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderAt } from '../../test/renderAt'

describe('navigation', () => {
  it('links to every section', async () => {
    renderAt('/')
    for (const [name, href] of [
      ['About me', '/about'],
      ['Stuff I make', '/projects'],
      ['Stuff I talk about', '/talks'],
    ] as const) {
      expect(await screen.findByRole('link', { name })).toHaveAttribute('href', href)
    }
  })

  it('marks the current section active from the URL, not from a click', async () => {
    renderAt('/talks')
    const talks = await screen.findByRole('link', { name: 'Stuff I talk about' })
    const about = await screen.findByRole('link', { name: 'About me' })
    expect(talks).toHaveClass('active')
    expect(about).not.toHaveClass('active')
  })

  it('does not mark home active on a sub-route', async () => {
    renderAt('/about')
    expect(await screen.findByRole('link', { name: /home/i })).not.toHaveClass('active')
  })
})
