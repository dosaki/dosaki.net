import { describe, it, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
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

  it('gives the home link an accessible name even though the mark is decorative', async () => {
    renderAt('/')
    const home = await screen.findByRole('link', { name: /home/i })
    expect(home).toHaveAttribute('href', '/')
  })

  it('shows the wordmark and strapline', async () => {
    renderAt('/')
    expect(await screen.findByText('Tiago Correia')).toBeInTheDocument()
    expect(screen.getByText('Head of Technology')).toBeInTheDocument()
  })

  it('shows a copyright line in the footer', async () => {
    renderAt('/')
    const footer = await screen.findByRole('contentinfo')
    // The year is derived, not hardcoded, so this does not break in January.
    expect(
      within(footer).getByText(`© ${new Date().getFullYear()} Tiago Correia`),
    ).toBeInTheDocument()
  })
})
