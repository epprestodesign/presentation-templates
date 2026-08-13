/* Slide-px → PowerPoint inches, and the shared shape of an emitted element.
 *
 * The whole export rests on one arithmetic fact: the artboard is 1280x720 CSS
 * px, and at 96 px/inch that is exactly 13.333in x 7.5in — PowerPoint's and
 * Google Slides' 16:9 slide. So conversion is a divide by 96 with no scaling,
 * no rounding strategy, and no layout re-flow. Every coordinate a template
 * already uses is directly meaningful to the exporter.
 *
 * That is why templates position absolutely in px. A flow-layout slide would
 * have no coordinates to export.
 */
import { canvas } from '../../tokens/tokens.js'

/** px → inches. */
export const inch = (px: number): number => px / canvas.pxPerInch

/** The slide, in inches. */
export const SLIDE_IN = {
  width: inch(canvas.width),
  height: inch(canvas.height),
}

/** A rect in slide px, converted to the x/y/w/h inches PptxGenJS expects. */
export function rect(x: number, y: number, w: number, h: number) {
  return { x: inch(x), y: inch(y), w: inch(w), h: inch(h) }
}

/** px → points, for type sizes. 1pt = 1/72in, and 1px = 1/96in, so pt = px * 0.75.
 *
 *  PowerPoint sizes text in points while the artboard is described in pixels, so
 *  this is the one place the two unit systems meet. Getting it wrong is not
 *  subtle — a 3/4 error makes every headline visibly wrong. */
export const pt = (px: number): number => +(px * 0.75).toFixed(2)

/** Strip the leading '#' PptxGenJS does not want. */
export const hex = (color: string): string => color.replace('#', '').toUpperCase()
