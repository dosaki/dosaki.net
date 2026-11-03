import { describe, it, expect } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import { renderAt } from '../../test/renderAt'

describe('quaternion cube route', () => {
  it('is reachable from the projects page without a full reload', async () => {
    renderAt('/projects')
    fireEvent.click(await screen.findByRole('link', { name: 'Quaternion Cube' }))
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Quaternion Cube' }),
    ).toBeInTheDocument()
  })

  // S3 serves the page's own index.html (for link previews) by redirecting to
  // the trailing-slash URL, so the router must accept it.
  it('renders at the trailing-slash URL too', async () => {
    renderAt('/projects/quaternion-cube/')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Quaternion Cube' }),
    ).toBeInTheDocument()
  })

  it('restores the site title after navigating away', async () => {
    renderAt('/projects/quaternion-cube')
    await screen.findByRole('heading', { level: 1, name: 'Quaternion Cube' })
    expect(document.title).toBe('Quaternion Cube · Tiago Correia')
    fireEvent.click(within(screen.getByRole('main')).getByRole('link', { name: /Stuff I make/ }))
    await screen.findByRole('heading', { level: 1, name: 'Stuff I make' })
    expect(document.title).toBe('Tiago Correia · Head of Technology')
  })

  it('keeps "Stuff I make" active in the nav', async () => {
    renderAt('/projects/quaternion-cube')
    await screen.findByRole('heading', { level: 1, name: 'Quaternion Cube' })
    const nav = screen.getByRole('navigation')
    expect(nav.querySelector('a.active')).toHaveTextContent('Stuff I make')
  })

  it('starts slightly turned rather than at the identity', async () => {
    renderAt('/projects/quaternion-cube')
    const line = '0.991 + 0.075i + 0.070j − 0.085k'
    expect(
      await screen.findByText((_, el) => el?.tagName === 'DIV' && el.textContent?.trim() === line),
    ).toBeInTheDocument()
    // The sliders keep the starting values exactly as written.
    expect(screen.getByLabelText('w')).toHaveValue('0.99')
    expect(screen.getByLabelText('z')).toHaveValue('-0.085')
  })

  it('updates the quaternion when a component slider moves', async () => {
    renderAt('/projects/quaternion-cube')
    await screen.findByLabelText('w')
    // All four components at 0 is not a rotation; the page says so.
    for (const c of ['w', 'x', 'y', 'z']) {
      fireEvent.change(screen.getByLabelText(c), { target: { value: '0' } })
    }
    expect(screen.getByText(/is not a rotation/)).toBeInTheDocument()
  })

  it('records each 90° turn in the composition history', async () => {
    renderAt('/projects/quaternion-cube')
    fireEvent.click(await screen.findByRole('button', { name: '+90° X' }))
    expect(screen.getByText(/q ← r·q\s+r = \+90° about X/)).toBeInTheDocument()
  })

  it('explains i, j and k with the live x, y and z values', async () => {
    renderAt('/projects/quaternion-cube')
    const summary = await screen.findByText(/What are/)
    const details = summary.closest('details')!
    expect(details).toHaveTextContent('k = i·j')
    expect(details).toHaveTextContent('x = 0.075')
    expect(details).toHaveTextContent('w = 0.991 means a turn of θ = 15.3°')
    fireEvent.click(screen.getByRole('button', { name: '+90° X' }))
    await screen.findByText(/x = 0\.7\d\d/)
  })
})
