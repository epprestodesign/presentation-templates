<script setup>
/**
 * StatCard — one KPI tile: a label, a big number, optional supporting copy
 * and a corner icon.
 *
 * The reference deck uses two fills interchangeably — the #f5f5f5 muted card
 * and the brand gradient — and reverses the ink on the second. Both are one
 * component so a row of six tiles (slide 07) can mix them without drifting.
 *
 * Number and label order flips between slides: the traction tiles put the
 * label above the number, the revenue-durability tiles put it below. That is
 * the `order` prop rather than two components.
 */
import { computed } from 'vue'
import { radius } from '../../tokens/tokens.js'
import Icon from '../brand/Icon.vue'

const props = defineProps({
  /** The KPI name, e.g. 'Room Nights'. */
  label: { type: String, default: '' },
  /** The number itself, pre-formatted, e.g. '1.9M' or '615K'. */
  value: { type: String, default: '' },
  /** Optional sentence under the pair. */
  description: { type: String, default: '' },
  /** 'muted' #f5f5f5 fill · 'brand' gradient fill · 'plain' no fill */
  surface: { type: String, default: 'muted' },
  /** 'label-first' (label above value) | 'value-first' */
  order: { type: String, default: 'label-first' },
  /** Material Symbols glyph pinned to the top-right, e.g. 'trending_up'. */
  icon: { type: String, default: '' },
  /** Type step for the number: 'stat' | 'statSm' | 'h1'. */
  valueSize: { type: String, default: 'stat' },
  /** Anchors the content block to the bottom of the tile, as the deck does
   *  when tiles are tall and the number should sit on the floor. */
  align: { type: String, default: 'bottom' },
  padding: { type: Number, default: 28 },
})

const onBrand = computed(() => props.surface === 'brand')

const style = computed(() => ({
  padding: `${props.padding}px`,
  borderRadius: `${radius.card}px`,
  justifyContent: props.align === 'bottom' ? 'flex-end' : 'flex-start',
}))

/** kebab for the type utility class: statSm → stat-sm. */
const valueClass = computed(() => `ds-text-${props.valueSize.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`)
</script>

<template>
  <div class="ds-stat-card" :class="`ds-stat-card--${surface}`" :style="style">
    <Icon v-if="icon" :name="icon" :size="42" :weight="300" class="ds-stat-card__icon" />

    <div class="ds-stat-card__body" :class="{ 'ds-stat-card__body--reversed': order === 'value-first' }">
      <div v-if="label" class="ds-stat-card__label ds-text-h4" :class="onBrand ? 'ds-text-on-brand' : ''">
        {{ label }}
      </div>
      <div v-if="value" class="ds-stat-card__value" :class="[valueClass, onBrand ? 'ds-text-on-brand' : 'ds-text-accent-deep']">
        {{ value }}
      </div>
      <p v-if="description" class="ds-stat-card__desc ds-text-body-sm" :class="onBrand ? 'ds-text-on-brand-subtle' : 'ds-text-cool'">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.ds-stat-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.ds-stat-card--muted { background: var(--slide-color-surface-muted); }
.ds-stat-card--brand { background: var(--slide-gradient-brand); }
.ds-stat-card--plain { background: transparent; }

.ds-stat-card__icon {
  position: absolute;
  top: v-bind("`${padding}px`");
  right: v-bind("`${padding}px`");
  color: var(--slide-color-accent);
}

.ds-stat-card--brand .ds-stat-card__icon { color: var(--slide-color-text-on-brand); }

.ds-stat-card__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* The label/value pair swaps order without changing the DOM, so the label
   stays the accessible heading regardless of visual order. */
.ds-stat-card__body--reversed {
  flex-direction: column-reverse;
  /* column-reverse would also flip the description to the top, so the
     description opts back out. */
  justify-content: flex-end;
}

.ds-stat-card__body--reversed .ds-stat-card__desc { order: -1; }

.ds-stat-card__desc { margin-top: 4px; }
</style>
