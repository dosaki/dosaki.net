import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderAt } from '../../test/renderAt'

describe('routes', () => {
  it('renders the home route', async () => {
    renderAt('/')
    expect(
      await screen.findByRole('heading', { name: /I make things/i }),
    ).toBeInTheDocument()
  })
})
