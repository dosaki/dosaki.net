import type { SocialLink } from './types'

export const site = {
  brand: {
    name: 'Tiago Correia',
    strapline: 'Head of Technology',
    positioning: '',
  },
  meta: {
    title: 'Tiago Correia · Head of Technology',
    description:
      'Tiago Correia · Head of Technology. Things I make, things I talk about.',
  },
  titles: {
    projects: 'Stuff I make',
    talks: 'Stuff I talk about',
  },
  home: {
    heading: "Hi! I'm Tiago and I make things!",
    small: 'Also I mentor kids with their programming.',
  },
  about: {
    heading: 'Tiago "Dosaki" Correia',
    photo: { src: '/images/minime.jpg', alt: 'Me as a toddler at a computer' },
    social: [
      { label: 'Email', href: 'mailto:tiago.f.a.correia@gmail.com', icon: 'envelope' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/dosaki/', icon: 'linkedin' },
      { label: 'Twitter', href: 'https://twitter.com/dosaki', icon: 'twitter' },
    ] satisfies SocialLink[],
    paragraphs: [
      [{ text: "I'm a software developer from Portugal. Currently living in the UK." }],
      [
        { text: 'I work at ' },
        { text: 'The Keyholding Company', href: 'https://keyholding.com/' },
        { text: ' as the Lead Backend Developer.' },
      ],
      [
        { text: 'Before, I worked as the Software Development Manager at ' },
        { text: 'Panintelligence', href: 'https://www.panintelligence.com/' },
        { text: ', where I got to play with data and mentor our devs.' },
      ],
      [
        { text: "Online, I use '" },
        { text: 'Dosaki', emphasis: true },
        { text: "' as my monicker." },
      ],
      [
        { text: "Building things is my passion and I've been doing it for quite some time." },
      ],
      [
        { text: 'I run the python and javascript sessions for my local Code Club to help kids learn how to program and I mentor a promising group at a ' },
        { text: 'CoderDojo', href: 'https://harrogatecoderdojo.github.io/' },
        { text: '.' },
      ],
      [{ text: "You'll find I talk mostly about tech, video, board games... and containers. I talk a lot about containers." }],
    ] satisfies { text: string; href?: string; emphasis?: boolean }[][],
  },
}
