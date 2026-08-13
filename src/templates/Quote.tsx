import type { CSSProperties } from 'react'
import { canvas, grid } from '../tokens/tokens.js'
import type { RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { AccentText } from '../elements/text/AccentText'
import { Icon } from '../elements/brand/Icon'
import { img } from '../assets/imagery'
import { typeClass } from '../lib/typeClass'
import styles from './Quote.module.css'

/**
 * Template — Quote.
 *
 * One sentence somebody else said, at size, with the attribution under it: a
 * customer testimonial, a partner's line in a QBR, the sentence from an
 * onboarding call that explains the whole product better than the product page
 * does.
 *
 * The copy stack is built here rather than with `SlideHeading` for the same
 * reason `Statement` builds its own: `SlideHeading` cannot set a headline on a
 * dark surface — its `onDark` flag reaches the lead but the shared `ds-text-*`
 * rule sets `color` on the title, so a quote on the brand plate would render
 * black on teal. That is a real bug this repo has already shipped once.
 *
 * The quote is `RichText`, so the clause that matters can be set in the accent
 * teal on a light slide. Resist doing that on the brand variant: teal on teal is
 * invisible, and `accentWarm` is the token that exists for stressing a word
 * there.
 *
 * Attribution is a monogram by default, not a headshot. A testimonial slide with
 * a face on it is making a much stronger claim than one with initials, so
 * attaching a real photograph to illustrative copy is a mistake the template
 * should not make easy — `photo` exists, and it should carry a real person who
 * really said it.
 */

export interface QuoteAttribution {
  name: string
  /** Job title. */
  role?: string
  company?: string
  /** Imagery name for a headshot, e.g. 'team/circle/tim-brown'. Omit for the
   *  monogram. */
  photo?: string
  /** Monogram letters. Derived from `name` when omitted. */
  initials?: string
  /** Imagery name for a company mark, set opposite the attribution. */
  logo?: string
}

export interface QuoteProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  quote?: RichText
  attribution?: QuoteAttribution

  /** 'light' is paper; 'brand' is the gradient, for the one testimonial in a
   *  deck that should stop the reader. */
  surface?: 'light' | 'brand'
  /** Named background plate for the brand surface, e.g. 'backgrounds/brand-hex'.
   *  Left unset by default so the template depends on no image file — the CSS
   *  gradient is the fallback and it is the same gradient. */
  plate?: string

  /** Decorative quotation glyph above the copy. */
  mark?: boolean
  markSize?: number
  /** Type step for the quote itself. 'h1' holds about 30 words; drop to 'h2'
   *  past that and go up to 'display' for a sentence under ten. */
  size?: TypeStep
  align?: 'left' | 'center'

  /** Width of the copy column. Clamped to the watermark gutter, so a story
   *  cannot accidentally run a quote under the wordmark. */
  width?: number
  left?: number
  top?: number
  /** Gap between the quote and the rule above the attribution. */
  gap?: number

  /** Short teal rule between quote and attribution. 0 removes it. */
  ruleWidth?: number
  /** Diameter of the headshot / monogram. 0 removes it. */
  avatarSize?: number
  /** Rendered height of a company mark. */
  logoHeight?: number
}

/** 'Marisol Okafor-Reyes' → 'MO'. First and last initial, which is the pair a
 *  reader matches to the name printed beside it; middle initials only make the
 *  disc busier. */
function monogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  const first = parts[0][0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : ''
  return (first + last).toUpperCase()
}

export function Quote({
  fit = 'contain',
  quote,
  attribution,
  surface = 'light',
  plate,
  mark = true,
  markSize = 72,
  size = 'h1',
  align = 'left',
  width = 900,
  left = grid.marginX,
  top = 150,
  gap = 36,
  ruleWidth = 64,
  avatarSize = 64,
  logoHeight = 40,
  ...chrome
}: QuoteProps) {
  const onDark = surface === 'brand'

  /* Every full-width element on a slide showing the watermark stops at the
   * gutter, not at the margin. The quote column is the widest thing here, so the
   * clamp lives on it rather than being restated per story. */
  const maxWidth =
    canvas.width - left - (chrome.watermark === false ? grid.marginX : grid.watermarkGutter)
  const copyStyle: CSSProperties = {
    left,
    top,
    width: Math.min(width, maxWidth),
    gap,
    alignItems: align === 'center' ? 'center' : 'flex-start',
    textAlign: align,
  }

  const initials = attribution ? (attribution.initials ?? monogram(attribution.name)) : ''

  return (
    <SlideFrame fit={fit} surface={surface} plate={plate} {...chrome}>
      <div className={styles.copy} style={copyStyle}>
        {mark && (
          <Icon
            name="format_quote"
            size={markSize}
            weight={300}
            filled
            color={onDark ? 'var(--slide-color-rule-on-brand-strong)' : 'var(--slide-color-accent)'}
          />
        )}

        {quote && (
          <AccentText
            as="blockquote"
            content={quote}
            className={[typeClass(size), styles.quote, onDark ? 'ds-text-on-brand' : '']
              .filter(Boolean)
              .join(' ')}
          />
        )}

        {attribution && (
          <div className={styles.attribution}>
            {ruleWidth > 0 && (
              <span
                className={[styles.rule, onDark ? styles.ruleOnBrand : ''].filter(Boolean).join(' ')}
                style={{ width: ruleWidth }}
              />
            )}

            <div className={styles.credit}>
              {avatarSize > 0 && (
                <span
                  className={[styles.avatar, onDark ? styles.avatarOnBrand : '']
                    .filter(Boolean)
                    .join(' ')}
                  style={{ width: avatarSize, height: avatarSize }}
                >
                  {attribution.photo ? (
                    <img src={img(attribution.photo)} alt="" className={styles.photo} />
                  ) : (
                    <span className={`${styles.initials} ds-text-h4`}>{initials}</span>
                  )}
                </span>
              )}

              <div className={styles.names}>
                <span
                  className={['ds-text-subhead', onDark ? 'ds-text-on-brand' : '']
                    .filter(Boolean)
                    .join(' ')}
                >
                  {attribution.name}
                </span>
                {/* Role and company on one line, separated by a thin bar. They
                    are one fact — where this person sits — and stacking them
                    made the block taller than the name it supports. */}
                {(attribution.role || attribution.company) && (
                  <span
                    className={[
                      'ds-text-body',
                      styles.role,
                      onDark ? 'ds-text-on-brand-subtle' : 'ds-text-muted',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {[attribution.role, attribution.company].filter(Boolean).join('  |  ')}
                  </span>
                )}
              </div>

              {attribution.logo && (
                <img
                  src={img(attribution.logo)}
                  alt=""
                  className={styles.logo}
                  style={{ height: logoHeight }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </SlideFrame>
  )
}
