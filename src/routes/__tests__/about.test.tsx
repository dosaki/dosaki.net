import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderAt } from '../../test/renderAt'

describe('about route', () => {
  it('renders the heading and biography', async () => {
    renderAt('/about')
    expect(
      await screen.findByRole('heading', { name: 'Tiago Correia / Dosaki' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/software developer from Portugal/i),
    ).toBeInTheDocument()
  })

  it('exposes labelled social links', async () => {
    renderAt('/about')
    expect(await screen.findByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/dosaki/',
    )
  })

  it('defaults the chart mode to projects', async () => {
    renderAt('/about')
    // In projects mode the "by years" phrase is the actionable toggle...
    expect(await screen.findByRole('link', { name: 'a few years' })).toBeInTheDocument()
    // ...and the "by projects" phrase is inert text, not a link.
    expect(
      screen.queryByRole('link', { name: 'various programming languages' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Show by years' })).toHaveAttribute(
      'href',
      expect.stringContaining('by=years'),
    )
  })

  it('reads the chart mode from the URL', async () => {
    renderAt('/about?by=years')
    expect(
      await screen.findByRole('link', { name: 'various programming languages' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'a few years' })).not.toBeInTheDocument()
  })

  it('falls back to projects for an unknown mode', async () => {
    renderAt('/about?by=nonsense')
    expect(await screen.findByRole('link', { name: 'a few years' })).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'various programming languages' }),
    ).not.toBeInTheDocument()
  })

  it('emphasises the Dosaki monicker', async () => {
    renderAt('/about')
    const emphasised = await screen.findByText('Dosaki')
    expect(emphasised.tagName).toBe('EM')
  })

  it('keeps the photo aside attached to the sentence it belongs to', async () => {
    renderAt('/about')
    const aside = await screen.findByText(/yes that's me/i)
    // The aside belongs inside the "Building things is my passion" paragraph,
    // not adrift after the photo.
    expect(aside.closest('p')?.textContent).toMatch(/Building things is my passion/)
  })
})
