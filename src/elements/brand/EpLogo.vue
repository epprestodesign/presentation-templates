<script setup>
/**
 * EpLogo — the EventPipe mark, in the three parts a slide actually needs.
 *
 * The source artwork (src/assets/logo/eventpipe-logo.svg, a 128x33 viewBox)
 * is a single lockup containing the hex glyph followed by the wordmark. The
 * deck uses them separately — the bottom-right watermark stacks a rotated
 * wordmark above an upright glyph — so rather than maintain three divergent
 * SVG files, this clips one source through a window. Vector stays vector,
 * and there is only ever one file to update when the logo changes.
 */
import { computed } from 'vue'
import logoColor from '../../assets/logo/eventpipe-logo.svg'
import logoWhite from '../../assets/logo/eventpipe-logo-fff.svg'
import logoBlack from '../../assets/logo/eventpipe-logo-000.svg'

const props = defineProps({
  /** 'full' the whole lockup · 'glyph' the hex only · 'wordmark' the type only */
  variant: { type: String, default: 'full' },
  /** 'color' on light surfaces · 'white' on brand/photography · 'black' mono */
  tone: { type: String, default: 'color' },
  /** Rendered height in slide px. Width follows the variant's aspect. */
  height: { type: Number, default: 33 },
  /** Rendered width in slide px. Takes precedence over `height` — the
   *  watermark is specified by its length, not its weight. */
  width: { type: Number, default: null },
})

/** Source artwork geometry, in viewBox units.
 *
 *  The split points are the real path bounding boxes, measured with
 *  `node scripts/measure-logo.mjs` rather than eyeballed — guessing them cut
 *  the leading "e" off the wordmark and produced "aventpipe":
 *
 *    path[0] glyph      x  0.00 → 27.85   y  0.00 → 32.01
 *    path[1] "event"    x 33.85 → 85.95   y  8.97 → 23.04
 *    path[2] "pipe"     x 87.95 → 127.29  y  5.87 → 26.14
 *
 *  Re-run that script if the logo artwork is ever replaced. */
const VIEWBOX = { width: 128, height: 33 }
const SPLIT = {
  glyphEnd: 27.85,
  wordmarkStart: 33.85,
  wordmarkEnd: 127.29,
  /** Ink height of the wordmark, for callers sizing it by length. */
  wordmarkInkHeight: 20.27,
}

const src = computed(() => ({ color: logoColor, white: logoWhite, black: logoBlack }[props.tone]))

/** The visible window into the artwork, in viewBox units. */
const window = computed(() => {
  if (props.variant === 'glyph') return { width: SPLIT.glyphEnd, offset: 0 }
  if (props.variant === 'wordmark') {
    return { width: SPLIT.wordmarkEnd - SPLIT.wordmarkStart, offset: SPLIT.wordmarkStart }
  }
  return { width: VIEWBOX.width, offset: 0 }
})

/** Scale from viewBox units to slide px. `width` wins when given, so the
 *  watermark can be specified by the length it occupies. */
const s = computed(() =>
  props.width ? props.width / window.value.width : props.height / VIEWBOX.height
)

const hostStyle = computed(() => ({
  width: `${window.value.width * s.value}px`,
  height: `${VIEWBOX.height * s.value}px`,
}))

const imgStyle = computed(() => ({
  width: `${VIEWBOX.width * s.value}px`,
  height: `${VIEWBOX.height * s.value}px`,
  marginLeft: `${-window.value.offset * s.value}px`,
}))
</script>

<template>
  <span class="ep-logo" :style="hostStyle">
    <img :src="src" alt="EventPipe" :style="imgStyle" />
  </span>
</template>

<style scoped>
.ep-logo {
  display: block;
  overflow: hidden;
  flex: none;
}

.ep-logo img {
  display: block;
  max-width: none;
}
</style>
