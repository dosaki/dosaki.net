import { describe, it, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderAt } from '../../test/renderAt'
import { talks } from '../../content/talks'
import { orderTalks } from '../../content/ordering'

describe('talks route', () => {
  it('renders the page heading', async () => {
    renderAt('/talks')
    expect(
      await screen.findByRole('heading', { name: 'Stuff I talk about' }),
    ).toBeInTheDocument()
  })

  it('renders talks newest first', async () => {
    renderAt('/talks')
    const list = await screen.findByRole('list', { name: 'Talks' })
    const headings = within(list).getAllByRole('heading', { level: 2 })
    expect(headings.map((h) => h.textContent?.trim())).toEqual(
      orderTalks(talks).map((t) => t.name),
    )
  })

  it('shows a status instead of a date when one is set', async () => {
    renderAt('/talks')
    expect(await screen.findByText('on-hold')).toBeInTheDocument()
  })
})
