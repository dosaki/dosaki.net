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
    expect(await screen.findByTestId('chart-mode')).toHaveTextContent('projects')
  })

  it('reads the chart mode from the URL', async () => {
    renderAt('/about?by=years')
    expect(await screen.findByTestId('chart-mode')).toHaveTextContent('years')
  })

  it('falls back to projects for an unknown mode', async () => {
    renderAt('/about?by=nonsense')
    expect(await screen.findByTestId('chart-mode')).toHaveTextContent('projects')
  })
})
