<script setup>
/**
 * Icon — one glyph from Material Symbols.
 *
 * The whole ~3,700-glyph library ships as three variable fonts (rounded,
 * outlined, sharp), self-hosted from the `material-symbols` package. Naming
 * a glyph is enough; there is no per-icon import and no sprite to maintain,
 * which is what makes an agent-authored slide cheap to write.
 *
 * Rounded at weight 300 is the default because it matches the thin,
 * geometric line icons in the reference deck.
 */
import { computed } from 'vue'

const props = defineProps({
  /** Material Symbols glyph name, e.g. 'trending_up', 'stadium', 'hotel'. */
  name: { type: String, required: true },
  /** 'rounded' | 'outlined' | 'sharp' */
  style: { type: String, default: 'rounded' },
  /** Rendered size in slide px. Also drives optical sizing. */
  size: { type: Number, default: 24 },
  /** Stroke weight, 100–700. The reference icons read as 300. */
  weight: { type: Number, default: 300 },
  /** Solid rather than outlined. */
  filled: { type: Boolean, default: false },
  /** Any CSS colour; defaults to inheriting from the slide. */
  color: { type: String, default: '' },
})

const cssStyle = computed(() => ({
  fontSize: `${props.size}px`,
  /* `opsz` must track the rendered size or small icons look spindly. */
  fontVariationSettings: `'FILL' ${props.filled ? 1 : 0}, 'wght' ${props.weight}, 'GRAD' 0, 'opsz' ${props.size}`,
  color: props.color || undefined,
  width: `${props.size}px`,
  height: `${props.size}px`,
}))
</script>

<template>
  <span class="ds-icon" :class="`material-symbols-${style}`" :style="cssStyle" aria-hidden="true">{{ name }}</span>
</template>

<style scoped>
.ds-icon {
  display: inline-grid;
  place-items: center;
  flex: none;
  line-height: 1;
  overflow: hidden;
}
</style>
