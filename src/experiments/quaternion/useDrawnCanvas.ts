import { useEffect, useRef, useState } from 'react'
import { readPalette, type Palette } from './draw'

// A square canvas that redraws after every render. Its size is state, so a
// resize re-renders too.
export function useDrawnCanvas(draw: (cv: HTMLCanvasElement, pal: Palette) => void) {
  const ref = useRef<HTMLCanvasElement>(null)
  const palette = useRef<Palette>(null)
  const [, setSize] = useState(0)

  useEffect(() => {
    const cv = ref.current
    if (!cv || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      const w = Math.round(cv.clientWidth * (window.devicePixelRatio || 1))
      if (w > 0 && cv.width !== w) cv.width = cv.height = w
      setSize(w)
    })
    ro.observe(cv)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!ref.current) return
    palette.current ??= readPalette()
    draw(ref.current, palette.current)
  })

  return ref
}
