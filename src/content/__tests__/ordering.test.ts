import { describe, it, expect } from 'vitest'
import { orderProjects, orderTalks } from '../ordering'
import type { Project, Talk } from '../types'

const project = (over: Partial<Project>): Project => ({
  name: 'x', description: '', icon: '', link: null, source: null,
  type: 'tool', status: 'active', tags: [], languages: [],
  lastCommit: '2020-01-01', ...over,
})

const talk = (over: Partial<Talk>): Talk => ({
  name: 'x', description: '', type: 'talk', date: 2020,
  link: null, status: null, tags: [], ...over,
})

describe('orderProjects', () => {
  it('puts the most recently committed project first', () => {
    const result = orderProjects([
      project({ name: 'old', lastCommit: '2019-05-01' }),
      project({ name: 'new', lastCommit: '2026-08-16' }),
      project({ name: 'mid', lastCommit: '2023-09-13' }),
    ])
    expect(result.map((p) => p.name)).toEqual(['new', 'mid', 'old'])
  })

  it('keeps archived projects after everything else, however recent', () => {
    const result = orderProjects([
      project({ name: 'archived-new', status: 'inactive', lastCommit: '2026-01-01' }),
      project({ name: 'done-old', status: 'done', lastCommit: '2018-01-01' }),
      project({ name: 'active-mid', status: 'active', lastCommit: '2022-01-01' }),
      project({ name: 'archived-old', status: 'inactive', lastCommit: '2017-01-01' }),
    ])
    expect(result.map((p) => p.name)).toEqual([
      'active-mid', 'done-old', 'archived-new', 'archived-old',
    ])
  })

  it('does not separate active from done: only the commit date decides', () => {
    const result = orderProjects([
      project({ name: 'active-old', status: 'active', lastCommit: '2020-01-01' }),
      project({ name: 'done-new', status: 'done', lastCommit: '2025-01-01' }),
    ])
    expect(result.map((p) => p.name)).toEqual(['done-new', 'active-old'])
  })

  it('breaks ties by name so the order is stable', () => {
    const result = orderProjects([
      project({ name: 'b', lastCommit: '2021-01-01' }),
      project({ name: 'a', lastCommit: '2021-01-01' }),
    ])
    expect(result.map((p) => p.name)).toEqual(['a', 'b'])
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


