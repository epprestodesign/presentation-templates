/* The PPTX emitter: SlideSpec[] → a .pptx of editable Google Slides.
 *
 * WHY THIS EXISTS AT ALL
 * ----------------------
 * Google Slides has no HTML import. Every "HTML to Slides" route flattens to
 * pictures. The only way to land editable text, shapes, tables and charts is to
 * write real OOXML — a .pptx — and let Drive convert it, which preserves text
 * boxes, shapes, tables and native charts as separate objects.
 *
 * WHAT MAKES IT TRACTABLE
 * -----------------------
 * The artboard is 1280x720 px at 96 px/in = exactly PowerPoint's 13.333 x 7.5in
 * 16:9 slide, so geometry converts by dividing by 96. And because a slide is
 * DATA rather than markup, there is a spec to walk — a DOM would have given
 * nothing to emit but a screenshot.
 *
 * WHAT SURVIVES, AND WHAT DOES NOT
 * --------------------------------
 *   survives   text (as styled runs in one box), rectangles, tables, native
 *              charts, images, and Poppins (a Google Font, so Slides keeps it)
 *   rasterised gradients — PptxGenJS still has no gradient fill, so a gradient
 *              becomes a background picture with live text on top
 *   lost       the rotated wordmark watermark is placed as an image; CSS-only
 *              effects such as color-mix borders resolve to flat colour
 */
import PptxGenJS from 'pptxgenjs'
import { canvas, color, grid, radius, type as typeTokens } from '../../tokens/tokens.js'
import type { RichText, SlideChromeSpec, TypeStep } from '../../types'
import { hex, inch, pt, rect, SLIDE_IN } from './geometry'
import { charSpacing, lineSpacing, toRuns } from './runs'
import { closeGradientRenderer, gradientPng, type GradientName } from './gradientPlate'

/* -------------------------------------------------------------------------
 * The emit spec — a narrow, exportable description of a slide.
 *
 * Deliberately NOT the React props. A template's props are tuned for authoring;
 * these are tuned for what OOXML can express. Keeping them separate means the
 * exporter never has to guess at a component's internal layout, and a template
 * can change its internals without breaking export.
 * ---------------------------------------------------------------------- */

export type EmitElement =
  | { kind: 'text'; text: RichText; step: TypeStep; x: number; y: number; w: number; h?: number
      align?: 'left' | 'center' | 'right'; onDark?: boolean; ink?: string; valign?: 'top' | 'middle' | 'bottom' }
  | { kind: 'rect'; x: number; y: number; w: number; h: number; fill?: string; radius?: number
      line?: { color: string; width: number } }
  | { kind: 'gradient'; x: number; y: number; w: number; h: number; name: GradientName; radius?: number }
  | { kind: 'image'; path: string; x: number; y: number; w: number; h: number; radius?: number }
  | { kind: 'table'; x: number; y: number; w: number; headers?: string[]
      rows: string[][]; colWidths?: number[]; rowHeight?: number
      headerFill?: string; headerInk?: string; rowFills?: string[] }
  | { kind: 'chart'; x: number; y: number; w: number; h: number
      type: 'bar' | 'line'; categories: string[]
      series: { name: string; values: number[] }[]; title?: string }

export interface EmitSlide extends SlideChromeSpec {
  /** 'light' | 'brand' | 'navy' — 'image' is expressed as a full-bleed image element. */
  surface?: 'light' | 'brand' | 'navy'
  /** Brand plate image path, used with surface 'brand'. */
  plate?: string
  elements: EmitElement[]
  /** Speaker notes. Survives the Drive conversion. */
  notes?: string
}

export interface EmitOptions {
  title?: string
  subject?: string
  author?: string
}

/* ---------------------------------------------------------------------- */

/** Text boxes need their internal padding zeroed, or PowerPoint insets the copy
 *  and every measurement drifts a few px from the HTML. */
const NO_INSET = { margin: 0 as const }

export async function emitPptx(
  slides: EmitSlide[],
  opts: EmitOptions = {}
): Promise<PptxGenJS> {
  const pptx = new PptxGenJS()

  // Exact 16:9 at the artboard's own dimensions, so nothing is scaled.
  pptx.defineLayout({ name: 'EP', width: SLIDE_IN.width, height: SLIDE_IN.height })
  pptx.layout = 'EP'
  pptx.title = opts.title ?? 'EventPipe'
  pptx.subject = opts.subject ?? ''
  pptx.author = opts.author ?? 'EventPipe'

  for (const spec of slides) {
    const slide = pptx.addSlide()
    const onDark = spec.surface === 'brand' || spec.surface === 'navy'

    /* --- background ------------------------------------------------- */
    if (spec.surface === 'navy') {
      slide.background = { color: hex(color.brandNavy as string) }
    } else if (spec.surface === 'brand') {
      // A plate is real artwork (gradient plus hex tessellation); without one,
      // rasterise the gradient token. Either way it is a picture, because
      // PptxGenJS cannot fill a shape with a gradient.
      const data = spec.plate
        ? undefined
        : await gradientPng('brandBleed', canvas.width, canvas.height)
      if (spec.plate) slide.addImage({ path: spec.plate, x: 0, y: 0, w: SLIDE_IN.width, h: SLIDE_IN.height })
      else slide.addImage({ data, x: 0, y: 0, w: SLIDE_IN.width, h: SLIDE_IN.height })
    } else {
      slide.background = { color: hex(color.surface as string) }
    }

    /* --- content ---------------------------------------------------- */
    for (const el of spec.elements) {
      switch (el.kind) {
        case 'text': {
          const runs = toRuns(el.text, { step: el.step, onDark: el.onDark ?? onDark, ink: el.ink })
          if (runs.length === 0) break
          slide.addText(runs as never, {
            ...rect(el.x, el.y, el.w, el.h ?? typeTokens.scale[el.step].size * 1.6),
            ...NO_INSET,
            align: el.align ?? 'left',
            valign: el.valign ?? 'top',
            lineSpacing: lineSpacing(el.step),
            charSpacing: charSpacing(el.step),
            // Never let PowerPoint resize the copy to fit; a slide that
            // overflows should be visibly wrong, not silently shrunk.
            shrinkText: false,
            wrap: true,
          })
          break
        }

        case 'rect': {
          slide.addShape(pptx.ShapeType.roundRect, {
            ...rect(el.x, el.y, el.w, el.h),
            fill: el.fill ? { color: hex(el.fill) } : { type: 'none' },
            line: el.line ? { color: hex(el.line.color), width: el.line.width } : { type: 'none' },
            // PowerPoint's roundRect radius is a FRACTION of the shorter side,
            // not a length — so a px radius has to be converted per shape or
            // every card gets a different curve than the HTML.
            rectRadius: Math.min(0.5, (el.radius ?? radius.card) / Math.min(el.w, el.h)),
          })
          break
        }

        case 'gradient': {
          const data = await gradientPng(el.name, el.w, el.h)
          slide.addImage({ data, ...rect(el.x, el.y, el.w, el.h) })
          break
        }

        case 'image': {
          slide.addImage({ path: el.path, ...rect(el.x, el.y, el.w, el.h) })
          break
        }

        case 'table': {
          const head = el.headers
            ? [
                el.headers.map((h) => ({
                  text: h,
                  options: {
                    bold: true,
                    color: hex(el.headerInk ?? (color.surface as string)),
                    fill: { color: hex(el.headerFill ?? (color.text as string)) },
                    fontFace: 'Poppins',
                    fontSize: pt(typeTokens.scale.bodySm.size),
                  },
                })),
              ]
            : []
          const body = el.rows.map((row, ri) =>
            row.map((cell) => ({
              text: cell,
              options: {
                color: hex(color.text as string),
                fill: el.rowFills?.[Math.min(ri, el.rowFills.length - 1)]
                  ? { color: hex(el.rowFills[Math.min(ri, el.rowFills.length - 1)]) }
                  : undefined,
                fontFace: 'Poppins',
                fontSize: pt(typeTokens.scale.body.size),
              },
            }))
          )
          slide.addTable([...head, ...body] as never, {
            x: inch(el.x),
            y: inch(el.y),
            w: inch(el.w),
            colW: el.colWidths?.map(inch),
            rowH: inch(el.rowHeight ?? 40),
            border: { type: 'none' },
            margin: 6,
            valign: 'middle',
          })
          break
        }

        case 'chart': {
          // A NATIVE chart: in Google Slides this arrives as a chart object
          // whose data can be edited, not a picture of a chart. This is the
          // single strongest argument for specs over markup.
          slide.addChart(
            el.type === 'line' ? pptx.ChartType.line : pptx.ChartType.bar,
            el.series.map((s) => ({ name: s.name, labels: el.categories, values: s.values })),
            {
              ...rect(el.x, el.y, el.w, el.h),
              chartColors: (color.series as string[]).map(hex),
              showLegend: el.series.length > 1,
              legendPos: 'b',
              showTitle: Boolean(el.title),
              title: el.title,
              titleFontFace: 'Poppins',
              titleFontSize: pt(typeTokens.scale.h4.size),
              catAxisLabelFontFace: 'Poppins',
              catAxisLabelFontSize: pt(typeTokens.scale.caption.size),
              valAxisLabelFontFace: 'Poppins',
              valAxisLabelFontSize: pt(typeTokens.scale.caption.size),
              barDir: 'col',
              barGapWidthPct: 55,
            }
          )
          break
        }
      }
    }

    /* --- chrome ----------------------------------------------------- */
    const chromeInk = onDark ? (color.textOnBrand as string) : (color.text as string)

    if (spec.eyebrow) {
      slide.addText(
        toRuns(spec.eyebrow.toUpperCase(), { step: 'eyebrow', ink: chromeInk }) as never,
        {
          ...rect(grid.marginX, grid.chromeY, 600, 20),
          ...NO_INSET,
          charSpacing: charSpacing('eyebrow'),
        }
      )
    }

    if (spec.pageNumber !== undefined && spec.pageNumber !== null && spec.pageNumber !== '') {
      const label =
        typeof spec.pageNumber === 'number'
          ? String(spec.pageNumber).padStart(2, '0')
          : spec.pageNumber
      slide.addText(toRuns(label, { step: 'pageNumber', ink: chromeInk }) as never, {
        ...rect(canvas.width - grid.marginX - 60, grid.chromeY, 60, 20),
        ...NO_INSET,
        align: 'right',
      })
    }

    if (spec.tag) {
      slide.addText(toRuns(spec.tag.toUpperCase(), { step: 'eyebrow', ink: chromeInk }) as never, {
        ...rect(grid.marginX, canvas.height - grid.marginBottom - 16, 400, 20),
        ...NO_INSET,
        charSpacing: charSpacing('eyebrow'),
      })
    }

    if (spec.notes) slide.addNotes(spec.notes)
  }

  await closeGradientRenderer()
  return pptx
}
