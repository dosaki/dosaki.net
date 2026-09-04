/**
 * A hand-drawn arrow, used to annotate the About portrait.
 *
 * Points right, along a long shallow rise, so it can sit in a row between the
 * label and the thing it indicates.
 *
 * Deliberately imprecise: the shaft's two curves have different slopes so it
 * never settles into a clean arc, and the head is two strokes of unequal
 * length meeting slightly off the tip rather than a filled triangle. A
 * symmetric head is what makes an SVG arrow read as a diagram; an uneven one
 * reads as a hand that didn't quite close the shape.
 *
 * Strokes inherit `currentColor` and scale with the box. Decorative — the
 * label beside it carries the meaning — so it stays out of the a11y tree.
 */
interface ScribbleArrowProps {
  className?: string
}

export function ScribbleArrow({ className }: ScribbleArrowProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 46"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Shaft: long and shallow, lifting toward the portrait. */}
      <path d="M 4 37 C 32 40 58 35 80 25 C 92 19 101 14 113 8" />
      {/* Head: two uneven strokes splaying back from the tip. */}
      <path d="M 113 8 L 95 8" />
      <path d="M 113 8 L 104 23" />
    </svg>
  )
}
