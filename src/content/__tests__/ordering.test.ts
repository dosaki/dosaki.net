import { describe, it, expect } from 'vitest'
import { orderProjects, orderTalks } from '../ordering'
import type { Project, Talk } from '../types'

const project = (over: Partial<Project>): Project => ({
  name: 'x', description: '', icon: '', link: null, source: null,
  type: 'tool', status: 'active', tags: [], ...over,
})

const talk = (over: Partial<Talk>): Talk => ({
  name: 'x', description: '', type: 'talk', date: 2020,
  link: null, status: null, tags: [], ...over,
})

describe('orderProjects', () => {
  it('bands by status: active, then done, then everything else', () => {
    const result = orderProjects([
      project({ name: 'c', status: 'inactive' }),
      project({ name: 'b', status: 'done' }),
      project({ name: 'a', status: 'active' }),
    ])
    expect(result.map((p) => p.name)).toEqual(['a', 'b', 'c'])
  })

  it('sorts by type within a band', () => {
    const result = orderProjects([
      project({ name: 'tool', type: 'tool', status: 'active' }),
      project({ name: 'bot', type: 'bot', status: 'active' }),
      project({ name: 'game', type: 'game', status: 'active' }),
    ])
    expect(result.map((p) => p.name)).toEqual(['bot', 'game', 'tool'])
  })

  it('does not mutate its input', () => {
    const input = [
      project({ name: 'b', status: 'done' }),
      project({ name: 'a', status: 'active' }),
    ]
    orderProjects(input)
    expect(input.map((p) => p.name)).toEqual(['b', 'a'])
  })
})

describe('orderTalks', () => {
  it('sorts by date, newest first', () => {
    const result = orderTalks([
      talk({ name: 'old', date: 2013 }),
      talk({ name: 'new', date: 2022 }),
      talk({ name: 'mid', date: 2020 }),
    ])
    expect(result.map((t) => t.name)).toEqual(['new', 'mid', 'old'])
  })
})
