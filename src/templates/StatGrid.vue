<script setup>
/**
 * Template — Stat Grid.
 *
 * Headline block up top, a row of KPI tiles across the floor of the slide.
 * Covers the traction slide (3 tiles), the revenue-durability slide (6 tiles
 * in two rows, mixing muted and brand fills) and the company-overview
 * snapshot (4 tiles).
 *
 * The tile row is a CSS grid inside an absolutely positioned well, so the
 * template takes a count rather than coordinates — adding a fourth tile
 * re-flows the row instead of needing new numbers.
 */
import { computed } from 'vue'
import { grid } from '../tokens/tokens.js'
import SlideFrame from '../elements/layout/SlideFrame.vue'
import SlideHeading from '../elements/layout/SlideHeading.vue'
import StatCard from '../elements/data/StatCard.vue'

const props = defineProps({
  /* --- chrome --- */
  eyebrow: { type: String, default: '' },
  pageNumber: { type: [Number, String], default: null },
  tag: { type: String, default: '' },
  watermark: { type: Boolean, default: true },
  fit: { type: String, default: 'contain' },

  /* --- copy --- */
  title: { type: [Array, String], default: '' },
  lead: { type: [Array, String], default: '' },
  titleWidth: { type: Number, default: 1000 },
  /** Secondary label above the tiles, e.g. '2026 Estimated Forecast'. */
  sublabel: { type: String, default: '' },
  sublabelWidth: { type: Number, default: 300 },
  /** Type step for the sublabel. The traction slide sets it at h2 so it
   *  wraps to two lines inside `sublabelWidth`. */
  sublabelSize: { type: String, default: 'h3' },

  /* --- tiles --- */
  /** One object per tile; keys match StatCard's props. */
  cards: { type: Array, default: () => [] },
  columns: { type: Number, default: 3 },
  /** Top edge of the tile well. */
  top: { type: Number, default: 360 },
  /** Height of the well. Two-row grids should raise this. */
  height: { type: Number, default: 317 },
  gap: { type: Number, default: 16 },
  /** Left inset of the tile row. Defaults to the page margin; a few
   *  reference slides run their tiles wider than the text column, so this
   *  is exposed rather than hard-coded. */
  inset: { type: Number, default: grid.marginX },
  /** Right inset. Defaults to the watermark gutter when the watermark is
   *  showing, so the row never runs under the wordmark, and to the plain
   *  page margin when it is not. */
  insetRight: { type: Number, default: null },
  /** Pins the row to an explicit width instead of filling to `insetRight`.
   *  The traction slide sizes its three tiles rather than stretching them. */
  wellWidth: { type: Number, default: null },
  /** Fill applied to any tile that does not name its own `surface`. */
  surface: { type: String, default: 'muted' },
})

const wellStyle = computed(() => {
  const style = {
    left: `${props.inset}px`,
    top: `${props.top}px`,
    height: `${props.height}px`,
    gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
    gap: `${props.gap}px`,
  }
  if (props.wellWidth) style.width = `${props.wellWidth}px`
  else style.right = `${props.insetRight ?? (props.watermark ? grid.watermarkGutter : grid.marginX)}px`
  return style
})
</script>

<template>
  <SlideFrame
    :eyebrow="eyebrow"
    :page-number="pageNumber"
    :tag="tag"
    :watermark="watermark"
    :fit="fit"
  >
    <SlideHeading v-if="title || lead" :title="title" :lead="lead" :width="titleWidth" />

    <div v-if="sublabel" class="ds-statgrid__sublabel" :class="`ds-text-${sublabelSize}`" :style="{ width: `${sublabelWidth}px` }">
      {{ sublabel }}
    </div>

    <div class="ds-statgrid__well" :style="wellStyle">
      <StatCard
        v-for="(card, i) in cards"
        :key="i"
        v-bind="card"
        :surface="card.surface || surface"
      />
    </div>
  </SlideFrame>
</template>

<style scoped>
.ds-statgrid__sublabel {
  position: absolute;
  left: var(--slide-grid-margin-x);
  top: 265px;
  z-index: 2;
}

.ds-statgrid__well {
  position: absolute;
  display: grid;
  z-index: 2;
}
</style>
