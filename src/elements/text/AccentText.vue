<script setup>
/**
 * AccentText — a headline where part of the sentence is set in the brand
 * teal, which is the deck's single most repeated typographic move
 * ("The core software business is growing <teal>before the new layers
 * arrive.</teal>").
 *
 * Content is a plain array so a slide stays data, never markup:
 *
 *   :content="['The core software business is growing ',
 *              { accent: 'before the new layers arrive.' }]"
 *
 * Supported run shapes: a bare string, or an object with exactly one of
 * `accent`, `bold`, `italic`, `underline`, or `muted`. Keeping runs as data
 * is what lets the PPTX emitter rebuild them as styled text runs inside one
 * editable text box rather than flattening the headline to an image.
 */
const props = defineProps({
  /** Array of runs, or a single string. */
  content: { type: [Array, String], required: true },
  /** Element to render as — headlines should stay real headings. */
  as: { type: String, default: 'h1' },
})

/** Normalise so the template only ever deals with run objects. */
function runs() {
  const list = Array.isArray(props.content) ? props.content : [props.content]
  return list.map((run) => (typeof run === 'string' ? { text: run } : { text: run.text ?? '', ...run }))
}

/** A run's text may live under `text` or under the style key itself. */
function textOf(run) {
  return run.text || run.accent || run.bold || run.italic || run.underline || run.muted || ''
}

function classOf(run) {
  return {
    'ds-run--accent': 'accent' in run,
    'ds-run--bold': 'bold' in run,
    'ds-run--italic': 'italic' in run,
    'ds-run--underline': 'underline' in run,
    'ds-run--muted': 'muted' in run,
  }
}
</script>

<template>
  <component :is="as" class="ds-accent-text">
    <span v-for="(run, i) in runs()" :key="i" :class="classOf(run)">{{ textOf(run) }}</span>
  </component>
</template>

<style scoped>
.ds-accent-text {
  /* Deliberately declares NO font properties. The size step arrives as a
     ds-text-* utility class from the template, and a `font: inherit` here
     would silently beat it — same specificity, but scoped component CSS is
     injected after app.css, so it wins the cascade and every headline
     collapses to body size. */

  /* Headlines in the deck wrap on their own terms; templates set the width
     and the copy breaks naturally. */
  text-wrap: balance;
}

.ds-run--accent { color: var(--slide-color-accent); }
.ds-run--bold { font-weight: var(--slide-font-weight-bold); }
.ds-run--italic { font-style: italic; }
.ds-run--underline { text-decoration: underline; text-underline-offset: 0.08em; }
.ds-run--muted { color: var(--slide-color-text-subtle); }
</style>
