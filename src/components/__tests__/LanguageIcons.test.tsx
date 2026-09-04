import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LanguageIcons } from '../LanguageIcons'
import { LANGUAGE_ICONS } from '../../icons/languages.generated'
import { projects } from '../../content/projects'

describe('LanguageIcons', () => {
  it('names each mark so it is not a mystery glyph', () => {
    render(<LanguageIcons languages={['javascript', 'terraform']} />)
    expect(screen.getByTitle('JavaScript')).toBeInTheDocument()
    expect(screen.getByTitle('Terraform')).toBeInTheDocument()
  })

  it('uses each mark\'s generated viewBox, not a blanket 24x24', () => {
    // The generator crops every viewBox tight to its glyph so the stylesheet
    // can size marks by height. A hardcoded box silently undoes that: Go's
    // wordmark occupies half the height of a square box and renders tiny.
    const { container } = render(<LanguageIcons languages={['go']} />)
    expect(container.querySelector('svg')).toHaveAttribute(
      'viewBox',
      LANGUAGE_ICONS.go.viewBox,
    )
  })

  it('renders nothing at all when a project has no languages', () => {
    const { container } = render(<LanguageIcons languages={[]} />)
    // Not an empty <ul>: that would still occupy the footer row and knock the
    // card out of line with its neighbours.
    expect(container).toBeEmptyDOMElement()
  })

  it('has a vendored mark for every language the content actually uses', () => {
    // The generator derives its icon set from projects.ts, so a language added
    // by a later derivation run without regenerating icons fails here rather
    // than crashing the page on an undefined path.
    for (const project of projects) {
      for (const language of project.languages) {
        expect(LANGUAGE_ICONS[language], `no icon vendored for "${language}"`).toBeDefined()
      }
    }
  })
})
