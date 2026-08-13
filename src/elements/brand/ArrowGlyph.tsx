/**
 * ArrowGlyph — the deck's own down arrow, as supplied artwork.
 *
 * Deliberately NOT a Material Symbol. `arrow_downward` is a different drawing:
 * a wider head on a shorter shaft, and its stroke weight is tied to the icon
 * font's axis rather than to the shape. This one is narrow-shafted with a
 * chevron head that reads at 60px over photography, which the Material glyph
 * does not — the section-opener mark on a full-bleed slide is a piece of brand
 * artwork, not an interface icon.
 *
 * The path is inlined rather than loaded from src/assets, because everything
 * under src/assets is gitignored (it holds original content). A component is
 * tracked, so the artwork survives a fresh clone.
 *
 * The path is drawn on a 100x100 viewBox but does not fill it: it spans
 * x 20.4–79.6 and y 12.5–87.5, so the INK is 59.2 x 75 — an aspect of 0.79.
 * `size` is therefore the ink height and the box is derived from it, which is
 * what lets a caller align the arrow to a cap height and get what they asked
 * for. Sizing the viewBox instead would leave ~17% invisible padding and the
 * arrow would land visibly smaller than its stated size.
 */
export interface ArrowGlyphProps {
  /** Height of the drawn arrow in slide px — the ink, not the box. */
  size?: number
  /** Any CSS colour. Defaults to the on-brand ink. */
  color?: string
  className?: string
}

/** Ink extents inside the 100x100 viewBox. */
const INK = { x: 20.4, y: 12.5, w: 59.2, h: 75 }

export function ArrowGlyph({
  size = 64,
  color = 'var(--slide-color-text-on-brand)',
  className,
}: ArrowGlyphProps) {
  const scale = size / INK.h
  return (
    <svg
      className={className}
      width={INK.w * scale}
      height={size}
      // Cropped to the ink so the element's box IS the arrow.
      viewBox={`${INK.x} ${INK.y} ${INK.w} ${INK.h}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <path
        d="M54.1668 16.6667C54.1668 14.3655 52.3014 12.5 50.0002 12.5C47.6989 12.5 45.8335 14.3655 45.8335 16.6667V73.2741L27.9465 55.3871C26.3192 53.76 23.6811 53.76 22.0539 55.3871C20.4267 57.0141 20.4267 59.6525 22.0539 61.2796L47.0539 86.2795C48.681 87.9066 51.3193 87.9066 52.9464 86.2795L77.9464 61.2796C79.5735 59.6525 79.5735 57.0141 77.9464 55.3871C76.3193 53.76 73.681 53.76 72.0539 55.3871L54.1668 73.2741V16.6667Z"
        fill={color}
      />
    </svg>
  )
}
