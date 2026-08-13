/* =============================================================
 * TIER 1 — Primitive ramps. Raw values only, no meaning attached.
 *
 * Templates and elements must NOT reference these directly; use the
 * semantic tokens in tokens.js instead. The Colors foundation story is
 * the one intentional exception, since it documents them.
 *
 * `orient` and `fountainBlue` are the EventPipe brand ramps derived from
 * the logo. Everything on a slide that reads as "EventPipe" comes out of
 * these two.
 * ============================================================= */

/** The blue half of the logo. Deep ends of gradients, chart series 2. */
export const orient = {
  50: '#effaff',
  100: '#dff5ff',
  200: '#b7ecff',
  300: '#77ddff',
  400: '#2fceff',
  500: '#04baf3',
  600: '#0099d0',
  700: '#007aa9',
  800: '#01658b',
  900: '#075373',
  950: '#05354c',
}

/** The teal half of the logo. The primary slide accent: highlighted
 *  headline clauses, KPI numbers, rules, chart series 1. */
export const fountainBlue = {
  50: '#ebfffd',
  100: '#cdfffb',
  200: '#a2fffa',
  300: '#62fef7',
  400: '#1bf5ef',
  500: '#00dbd8',
  600: '#02adb3',
  700: '#098d95',
  800: '#127078',
  900: '#135d66',
  950: '#063e46',
}

/** True (hue-less) gray. Slide surfaces and card fills read as neutral in
 *  the reference deck, not as the product UI's cool `graphite` ramp.
 *  `100` is exactly the #f5f5f5 card fill; `900`/`950` are the two
 *  near-blacks the reference headlines and body copy resolve to. */
export const neutral = {
  0: '#ffffff',
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#e5e5e5',
  300: '#d4d4d4',
  400: '#a3a3a3',
  500: '#808080',
  600: '#7b7b7b',
  700: '#525252',
  800: '#404040',
  900: '#202020',
  950: '#000000',
}

/** One borrowed Material ramp. The reference deck sets card body copy in
 *  #546e7a (Blue Grey 600) — a cooler gray than `neutral`, and distinct
 *  enough on screen to keep rather than flatten. */
export const blueGrey = {
  /* The light end was added after the comparison slide turned out to use a cool
     grey family throughout — band, step cards and rail. Substituting the neutral
     ramp read visibly warm against the teal beside it. */
  50: '#eceff1',
  100: '#cfd8dc',
  200: '#b0bec5',
  300: '#90a4ae',
  400: '#78909c',
  500: '#607d8b',
  600: '#546e7a',
  700: '#455a64',
}

export const palette = { orient, fountainBlue, neutral, blueGrey }
