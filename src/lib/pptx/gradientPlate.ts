/* Renders a brand gradient to a PNG, because PptxGenJS cannot draw one.
 *
 * Gradient shape fills have been an open request on PptxGenJS since 2017 and
 * are still absent in v4 — verified against the shipped type definitions, which
 * contain no mention of gradients at all. So a gradient panel cannot be a
 * native shape.
 *
 * The workaround that preserves what matters: rasterise the gradient into a
 * background PICTURE, then place the text on top as real text boxes. The panel
 * becomes an image the presenter cannot recolour, but the words stay editable —
 * which is the point of exporting to Google Slides rather than a PDF.
 *
 * Runs in Node via a headless Chromium page. It is the same renderer the
 * screenshot pipeline uses, so a plate and its on-screen counterpart come from
 * one implementation of the gradient rather than two.
 */
import { chromium, type Browser } from 'playwright'
import { gradient } from '../../tokens/tokens.js'

export type GradientName = keyof typeof gradient

let browser: Browser | null = null

async function getBrowser(): Promise<Browser> {
  if (!browser) browser = await chromium.launch()
  return browser
}

export async function closeGradientRenderer(): Promise<void> {
  await browser?.close()
  browser = null
}

/** Render one gradient at a given pixel size, as a base64 PNG data URI.
 *
 *  Rendered at 2x and downsampled by the consumer, because a gradient that
 *  lands on a whole-slide panel shows banding at 1x. */
export async function gradientPng(
  name: GradientName,
  width: number,
  height: number,
  scale = 2
): Promise<string> {
  const g = gradient[name]
  const b = await getBrowser()
  const page = await b.newPage({
    viewport: { width: Math.round(width), height: Math.round(height) },
    deviceScaleFactor: scale,
  })
  await page.setContent(
    `<body style="margin:0;width:100vw;height:100vh;background:linear-gradient(${g.angle}deg, ${g.from} 0%, ${g.to} 100%)"></body>`
  )
  const buf = await page.screenshot({ type: 'png' })
  await page.close()
  return `data:image/png;base64,${buf.toString('base64')}`
}
