import { ICON_PATHS, type IconName } from './paths.generated'

interface IconProps {
  name: IconName
  /** When present the icon is exposed to assistive tech with this label. */
  title?: string
  className?: string
}

export function Icon({ name, title, className }: IconProps) {
  const { w, h, d } = ICON_PATHS[name]
  return (
    <svg
      className={className}
      viewBox={`0 0 ${w} ${h}`}
      width="1em"
      height="1em"
      fill="currentColor"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path d={d} />
    </svg>
  )
}
