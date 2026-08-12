<script setup>
/**
 * SlideHeading — the title block that opens almost every content slide:
 * headline, then an optional lead paragraph beneath it.
 *
 * It anchors itself to the measured grid rather than accepting coordinates,
 * because the whole point of the anchors is that 40 slides put their
 * headline in the same place. Templates choose a `width` (how far across
 * the slide the copy runs) and a size step; nothing else.
 */
import { computed } from 'vue'
import { grid } from '../../tokens/tokens.js'
import AccentText from '../text/AccentText.vue'

const props = defineProps({
  /** Run array or string — see AccentText. */
  title: { type: [Array, String], default: '' },
  /** Optional paragraph under the headline. */
  lead: { type: [Array, String], default: '' },
  /** Type step for the headline: 'display' | 'h1' | 'h2'. */
  size: { type: String, default: 'h1' },
  /** How wide the copy column runs, in slide px. */
  width: { type: Number, default: 720 },
  /** Vertical start. Defaults to the deck's standard headline anchor. */
  top: { type: Number, default: grid.titleY },
  /** Left edge. Defaults to the page margin. */
  left: { type: Number, default: grid.marginX },
  /** Gap between headline and lead. */
  gap: { type: Number, default: 18 },
  /** Set on brand/photographic surfaces so the lead keeps its contrast. */
  onDark: { type: Boolean, default: false },
})

const style = computed(() => ({
  left: `${props.left}px`,
  top: `${props.top}px`,
  width: `${props.width}px`,
  gap: `${props.gap}px`,
}))
</script>

<template>
  <div class="ds-heading" :style="style">
    <AccentText v-if="title" :content="title" :class="`ds-text-${size}`" />
    <AccentText
      v-if="lead"
      as="p"
      :content="lead"
      class="ds-text-lead"
      :class="onDark ? 'ds-text-on-brand-subtle' : ''"
    />
  </div>
</template>

<style scoped>
.ds-heading {
  position: absolute;
  display: flex;
  flex-direction: column;
  z-index: 2;
}
</style>
