import { describe, it, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderAt } from '../../test/renderAt'
import { projects } from '../../content/projects'
import { orderProjects } from '../../content/ordering'

describe('projects route', () => {
  it('renders the page heading', async () => {
    renderAt('/projects')
    expect(
      await screen.findByRole('heading', { name: 'Stuff I make' }),
    ).toBeInTheDocument()
  })

  it('renders every project in banded order', async () => {
    renderAt('/projects')
    const list = await screen.findByRole('list', { name: 'Projects' })
    const headings = within(list).getAllByRole('heading', { level: 2 })
    expect(headings.map((h) => h.textContent)).toEqual(
      orderProjects(projects).map((p) => p.name),
    )
  })

  it('separates the status bands with a full-width rule between cards', async () => {
    renderAt('/projects')
    const list = await screen.findByRole('list', { name: 'Projects' })
    // orderProjects bands as active -> done -> inactive, so two boundaries.
    const breaks = list.querySelectorAll(':scope > li[aria-hidden="true"]')
    expect(breaks).toHaveLength(2)
    // The rule must be its own grid row, not tucked inside a card — in a
    // wrapping grid a rule inside one cell is not a separator across the row.
    for (const el of breaks) {
      expect(el.querySelector('hr')).not.toBeNull()
      expect(el.querySelector('h2')).toBeNull()
    }
  })

  it('links a project that has a source to its repository', async () => {
    renderAt('/projects')
    expect(
      await screen.findByRole('link', { name: 'Sqlow source' }),
    ).toHaveAttribute('href', 'https://github.com/dosaki/sqlow')
  })
})
