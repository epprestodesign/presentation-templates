<script setup>
/**
 * SlideFrame — the artboard every slide is built inside.
 *
 * Establishes the 1280x720 coordinate space that the whole system depends
 * on. Children position themselves absolutely in px against it, which is
 * what makes the PowerPoint / Google Slides export a straight divide-by-96
 * rather than a layout re-flow.
 *
 * Two fit modes:
 *   'contain' (default) scales the artboard down to whatever container it
 *      is in, for Storybook and the deck player. The transform is visual
 *      only — the coordinate space never changes.
 *   'none' renders at exactly 1280x720. The export scripts use this so
 *      headless Chromium rasterises pixel-for-pixel with no resampling.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { canvas } from '../../tokens/tokens.js'
import SlideChrome from './SlideChrome.vue'

const props = defineProps({
  /** 'light' white artboard · 'brand' gradient · 'image' full-bleed photo · 'navy' */
  surface: { type: String, default: 'light' },
  /** Full-bleed background image URL, used when surface is 'image'. */
  image: { type: String, default: '' },
  /** Scrim over a background image so text stays legible. 0–1. */
  scrim: { type: Number, default: 0 },
  /** Top-left section label. Omit to hide. */
  eyebrow: { type: String, default: '' },
  /** Top-right page number. Numbers are zero-padded to two digits. */
  pageNumber: { type: [Number, String], default: null },
  /** Bottom-left classification tag, e.g. 'CONFIDENTIAL'. */
  tag: { type: String, default: '' },
  /** Bottom-right rotated wordmark + glyph. */
  watermark: { type: Boolean, default: true },
  /** 'contain' scales to fit the container; 'none' renders at exact size. */
  fit: { type: String, default: 'contain' },
})

const host = ref(null)
const scale = ref(1)
let observer = null

function measure() {
  if (props.fit === 'none' || !host.value) return
  const { width } = host.value.getBoundingClientRect()
  if (width > 0) scale.value = width / canvas.width
}

onMounted(() => {
  if (props.fit === 'none') return
  measure()
  observer = new ResizeObserver(measure)
  observer.observe(host.value)
})

onBeforeUnmount(() => observer?.disconnect())

/** The host reserves the scaled height so the slide occupies real layout
 *  space; the artboard itself is transformed inside it. */
const hostStyle = computed(() =>
  props.fit === 'none'
    ? { width: `${canvas.width}px`, height: `${canvas.height}px` }
    : { width: '100%', height: `${canvas.height * scale.value}px` }
)

const artboardStyle = computed(() => {
  const style = {
    width: `${canvas.width}px`,
    height: `${canvas.height}px`,
  }
  if (props.fit !== 'none') {
    style.transform = `scale(${scale.value})`
    style.transformOrigin = 'top left'
  }
  if (props.surface === 'image' && props.image) {
    style.backgroundImage = `url("${props.image}")`
  }
  return style
})

/** Chrome ink flips to white on any dark surface. */
const onDark = computed(() => props.surface === 'brand' || props.surface === 'image' || props.surface === 'navy')
</script>

<template>
  <div ref="host" class="ds-slide-host" :style="hostStyle">
    <div
      class="ds-slide"
      :class="[`ds-slide--${surface}`, { 'ds-slide--fixed': fit === 'none' }]"
      :style="artboardStyle"
    >
      <!-- Scrim sits above the photo but below every layer of content. -->
      <div v-if="scrim > 0" class="ds-slide__scrim" :style="{ opacity: scrim }" />

      <SlideChrome
        :eyebrow="eyebrow"
        :page-number="pageNumber"
        :tag="tag"
        :watermark="watermark"
        :on-dark="onDark"
      />

      <slot />
    </div>
  </div>
</template>

<style scoped>
.ds-slide-host {
  /* Nothing may escape the artboard — a slide that bleeds is a bug that
     only shows up after export. */
  overflow: hidden;
}

.ds-slide {
  position: relative;
  overflow: hidden;
  font-family: var(--slide-font-family);
  color: var(--slide-color-text);
  background-color: var(--slide-color-surface);
  background-size: cover;
  background-position: center;
}

.ds-slide--brand {
  background-image: var(--slide-gradient-brand-bleed);
  color: var(--slide-color-text-on-brand);
}

.ds-slide--navy {
  background-color: var(--slide-color-brand-navy);
  color: var(--slide-color-text-on-brand);
}

.ds-slide--image {
  color: var(--slide-color-text-on-brand);
}

.ds-slide__scrim {
  position: absolute;
  inset: 0;
  background: #000;
  z-index: 1;
}
</style>
