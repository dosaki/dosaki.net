/**
 * A hand-drawn arrow, used to annotate the About portrait.
 *
 * Deliberately wobbly: the curve overshoots and doubles back slightly, and the
 * head is two strokes of unequal length rather than a filled triangle, so it
 * reads as drawn rather than constructed. Strokes inherit `currentColor` and
 * scale with the box, so the caller controls colour and size.
 *
 * Decorative by default — the "That's me!" label beside it carries the meaning,
 * so the arrow itself stays out of the accessibility tree.
 */
interface ScribbleArrowProps {
  className?: string
}

export function ScribbleArrow({ className }: ScribbleArrowProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 110 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Shaft: a shallow S that lifts toward the portrait. */}
      <path d="M 5 54 C 26 55 44 49 60 39 C 74 30 84 21 97 12" />
      {/* Head: two strokes, unequal, meeting off-centre. */}
      <path d="M 97 12 L 80 15" />
      <path d="M 97 12 L 92 28" />
    </svg>
  )
}
