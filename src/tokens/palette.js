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

/** The blue half of the logo. Deep ends of gradients, chart series 2.
 *
 *  Regenerated — every one of the 11 steps changed from the values this repo
 *  started with. `fountainBlue` was untouched by that regeneration and still
 *  matches to the byte, which is worth knowing: if the two ever disagree again,
 *  it is orient that moved. */
export const orient = {
  50: '#f0faff',
  100: '#dff4ff',
  200: '#b9ebfe',
  300: '#7bdcfe',
  400: '#35cbfb',
  500: '#0ab5ed',
  600: '#0093ca',
  700: '#0075a4',
  800: '#05658b',
  900: '#0a5170',
  950: '#07344a',
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

/* --- Complementary families -------------------------------------------
 *
 * Both brand ramps are cool — fountain-blue sits at ~183deg and orient at
 * ~197deg — so the system had no warm value at all, and three real gaps:
 *
 *   1. Emphasis ON the brand surface. Accent teal is effectively invisible
 *      against the brand gradient (documented in Elements/Text), which left
 *      weight as the only way to stress a word there. A warm accent fixes it.
 *   2. Financial direction. The model table has B/(W) variance columns and the
 *      comparison slides show deltas; "better" and "worse" need colour, and
 *      neither can be teal.
 *   3. Attention. Nothing said "check this".
 *
 * `coral` is the true complement of fountain-blue, so it carries maximum
 * separation from the brand without looking foreign beside it. `emerald` sits
 * at ~152deg, deliberately far enough from teal's 183deg to read as a different
 * idea rather than as a slightly-off brand colour — a green any closer muddies
 * against the accent. `amber` is the warning, and doubles as a highlight.
 *
 * These are SUPPORTING colours. A slide should still be predominantly brand;
 * if a deck starts looking coral, something has gone wrong.
 */

/** Warm accent, financial "worse than plan", and emphasis on brand surfaces. */
export const coral = {
  50: '#fff5f2',
  100: '#ffe7e0',
  200: '#ffd2c5',
  300: '#ffb29c',
  400: '#ff8863',
  500: '#fa6338',
  600: '#e5451a',
  700: '#bf3312',
  800: '#992c14',
  900: '#7d2917',
  950: '#441107',
}

/** Attention and highlight. */
export const amber = {
  50: '#fffaeb',
  100: '#fef0c7',
  200: '#fedf89',
  300: '#fec84b',
  400: '#fdb022',
  500: '#f79009',
  600: '#dc6803',
  700: '#b54708',
  800: '#93370d',
  900: '#7a2e0e',
  950: '#4e1d09',
}

/** Financial "better than plan", and confirmed states. */
export const emerald = {
  50: '#ecfdf3',
  100: '#d1fadf',
  200: '#a6f4c5',
  300: '#6ce9a6',
  400: '#32d583',
  500: '#12b76a',
  600: '#039855',
  700: '#027a48',
  800: '#05603a',
  900: '#054f31',
  950: '#02291a',
}

export const palette = { fountainBlue, orient, coral, amber, emerald, neutral, blueGrey }
