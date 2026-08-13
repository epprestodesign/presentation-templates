import type { Preview } from '@storybook/react-vite'
import '../src/styles/globals.css'

const preview: Preview = {
  parameters: {
    // Documentation is the DEFAULT here, not the exception: Styles and Elements
    // pages are reference material and should reflow with the browser. Only the
    // Templates opt into `layout: 'fullscreen'` plus the grey stage, because a
    // slide is a fixed 1280x720 artboard and anything else crops it.
    layout: 'padded',
    backgrounds: {
      options: {
        white: { name: 'white', value: '#ffffff' },
        // The mid grey a slide gets reviewed against, so the white edge of the
        // artboard stays visible.
        stage: { name: 'stage', value: '#e8eaed' },
        dark: { name: 'dark', value: '#202020' },
      },
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: {
      // 'todo' — surface violations in the test UI without failing CI.
      test: 'todo',
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: [
          // 0) Overview page, always first
          'Introduction',
          // 1) Foundations, rendered live from the tokens. Same list as
          //    eventpipe-prototype-ds, with one substitution: Breakpoints has
          //    no meaning for a fixed 1280x720 canvas, so that slot is
          //    "Grid & Safe Areas" instead.
          'Foundations',
          [
            'Colors',
            'Palette',
            'Typography',
            'Icons',
            'Logos',
            'Imagery',
            'Border Radius',
            'Spacing',
            'Elevation',
            'Motion',
            'Grid & Safe Areas',
          ],
          // 2) Elements — the pieces a slide is assembled from
          'Elements',
          ['Text', 'Data', 'Media', 'Layout', 'Brand'],
          // 3) Templates — the slide archetypes, with real rebuilt slides as
          //    their stories
          'Templates',
          [
            'Cover',
            'Section Divider',
            'Statement',
            'Headline + Image',
            'Headline + Chart',
            'Stat Grid',
            'Feature Cards',
            'Staircase Cards',
            'Comparison',
            'Tint Table',
            'Financial Table',
            'Split Panel',
            'Bullet + Image',
            'Team',
            'Logo Wall',
            'Diagram',
            'Full Bleed',
            'Device Showcase',
            'Closing',
          ],
          '*',
        ],
      },
    },
  },
  initialGlobals: { backgrounds: { value: 'white' } },
}

export default preview
