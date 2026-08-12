<script setup>
/**
 * SlideChrome — the four fixed marks that make a slide part of the deck:
 * eyebrow (top-left), page number (top-right), classification tag
 * (bottom-left) and the rotated wordmark watermark (bottom-right).
 *
 * Every coordinate here was measured off the reference deck rather than
 * chosen, so a rebuilt slide sits its chrome exactly where the original
 * did. They live in one component so no template can drift.
 */
import { computed } from 'vue'
import { grid } from '../../tokens/tokens.js'
import EpLogo from '../brand/EpLogo.vue'

const props = defineProps({
  eyebrow: { type: String, default: '' },
  pageNumber: { type: [Number, String], default: null },
  tag: { type: String, default: '' },
  watermark: { type: Boolean, default: true },
  /** Flips the chrome ink to white for brand / photographic surfaces. */
  onDark: { type: Boolean, default: false },
})

/** Length of the rotated wordmark, measured off the reference watermark.
 *  Its rotated footprint is what sizes the slot below. */
const WORDMARK_LENGTH = 101
/** The wordmark window is 93.44 viewBox units wide inside a 33-unit tall
 *  box (see EpLogo's measured SPLIT), so scaling it to WORDMARK_LENGTH makes
 *  the band this tall. That box includes transparent padding above and below
 *  the ~20-unit ink, which is why the rendered stripe reads thinner. */
const WORDMARK_BAND = Math.round((WORDMARK_LENGTH * 33) / 93.44)

/** The deck zero-pads page numbers to two digits ("01", not "1"). Strings
 *  pass through untouched so a slide can label itself "A6". */
const label = computed(() => {
  if (props.pageNumber === null || props.pageNumber === '') return ''
  return typeof props.pageNumber === 'number'
    ? String(props.pageNumber).padStart(2, '0')
    : props.pageNumber
})
</script>

<template>
  <div class="ds-chrome" :class="{ 'ds-chrome--on-dark': onDark }">
    <div v-if="eyebrow" class="ds-chrome__eyebrow ds-text-eyebrow">{{ eyebrow }}</div>

    <div v-if="label" class="ds-chrome__page ds-text-page-number">{{ label }}</div>

    <div v-if="tag" class="ds-chrome__tag ds-text-eyebrow">{{ tag }}</div>

    <div v-if="watermark" class="ds-chrome__watermark">
      <!-- The wordmark reads bottom-to-top. Rotating in place would leave
           the pre-rotation box in flow (101px wide instead of 101px tall),
           so it sits in a slot sized to its rotated footprint. -->
      <div class="ds-chrome__wordmark-slot">
        <EpLogo variant="wordmark" :tone="onDark ? 'white' : 'color'" :width="WORDMARK_LENGTH" />
      </div>
      <EpLogo variant="glyph" :tone="onDark ? 'white' : 'color'" :height="35" />
    </div>
  </div>
</template>

<style scoped>
/* The chrome layer never intercepts anything and always sits above content
   images but below nothing — content that must cover it is a design error. */
.ds-chrome {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
}

.ds-chrome__eyebrow {
  position: absolute;
  left: var(--slide-grid-margin-x);
  top: v-bind("`${grid.chromeY}px`");
  color: var(--slide-color-text);
}

.ds-chrome__page {
  position: absolute;
  right: var(--slide-grid-margin-x);
  top: v-bind("`${grid.chromeY}px`");
  color: var(--slide-color-text);
}

.ds-chrome__tag {
  position: absolute;
  left: var(--slide-grid-margin-x);
  bottom: var(--slide-grid-margin-bottom);
  color: var(--slide-color-text);
}

.ds-chrome--on-dark .ds-chrome__eyebrow,
.ds-chrome--on-dark .ds-chrome__page,
.ds-chrome--on-dark .ds-chrome__tag {
  color: var(--slide-color-text-on-brand);
}

/* Wordmark and glyph share a centre line at x≈1241; the glyph's baseline
   sits 39px off the bottom edge. */
.ds-chrome__watermark {
  position: absolute;
  right: 24px;
  bottom: 39px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
}

.ds-chrome__wordmark-slot {
  width: v-bind("`${WORDMARK_BAND}px`");
  height: v-bind("`${WORDMARK_LENGTH}px`");
  display: grid;
  place-items: center;
}

.ds-chrome__wordmark-slot > * {
  transform: rotate(-90deg);
  transform-origin: center;
}
</style>
