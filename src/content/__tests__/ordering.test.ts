import { describe, it, expect } from 'vitest'
import { chartValue, orderProjects, orderTalks } from '../ordering'
import type { LanguageStat, Project, Talk } from '../types'

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

const stat = (over: Partial<LanguageStat>): LanguageStat => ({
  projects: [],
  startYear: null,
  endYear: null,
  ...over,
})

describe('chartValue', () => {
  it('projects mode returns the project count', () => {
    expect(chartValue(stat({ projects: ['a', 'b', 'c'] }), 'projects')).toBe(3)
  })

  it('years mode returns the span between start and end year', () => {
    expect(chartValue(stat({ startYear: 2012, endYear: 2020 }), 'years')).toBe(8)
  })

  it('falls back to 1 when both years are null (e.g. c#/lua)', () => {
    expect(chartValue(stat({ startYear: null, endYear: null }), 'years')).toBe(1)
  })

  it('returns 1 for a one-year span', () => {
    expect(chartValue(stat({ startYear: 2020, endYear: 2021 }), 'years')).toBe(1)
  })
})
