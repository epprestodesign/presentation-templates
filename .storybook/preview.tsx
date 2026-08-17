import type { Preview } from '@storybook/react-vite'
import { ThemeProvider } from '@mui/material/styles'
import { muiTheme } from '../src/lib/muiTheme'
import '../src/styles/globals.css'

const preview: Preview = {
  // Every MUI X chart and grid reads @mui/material's theme, so without this
  // they render in MUI's default blue and Roboto — visibly off-brand beside a
  // slide. Applied globally rather than per story so nothing has to remember,
  // including charts that end up inside a slide template.
  decorators: [
    (Story) => (
      <ThemeProvider theme={muiTheme}>
        <Story />
      </ThemeProvider>
    ),
  ],
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
          // 2) The MUI X libraries, as siblings of Foundations. Both are
          //    Community/MIT — nothing here needs a licence key. They are a
          //    component catalogue for mocking product UI, NOT slide elements:
          //    a grid has sorting and hover, a slide has neither.
          'Charts',
          ['Overview', 'Bar', 'Line', 'Pie', 'Scatter', 'Radar', 'Gauge & Sparkline'],
          'Data Grid',
          ['Overview', 'Basics', 'Static'],
          // 3) Components — the pieces a slide is assembled from.
          //    Overview leads, because the first question about a shared
          //    component is "what breaks if I change it", and that page answers
          //    it from the source rather than from memory.
          'Components',
          ['Overview', 'Text', 'Data', 'Media', 'Layout', 'Brand'],
          // 4) Diagrams — the ported diagram-design types, each rendered as a
          //    finished slide with its own copy. Their own category rather than
          //    a Templates folder: a diagram type is chosen by what it SHOWS
          //    (components, decisions, time, overlap), which is a different
          //    question from what job the slide does.
          'Diagrams',
          ['Overview'],
          // 5) THE SLIDE TYPES, as top-level categories rather than folders
          //    under a 'Templates' parent.
          //
          //    Flattened because a folder inside a category cost a click on the
          //    thing this system is FOR: you come here to find a slide, and
          //    'Templates → Data → Stat Grid' buried the useful noun two levels
          //    down. As siblings they also sit level with Diagrams, which
          //    likewise produces finished slides.
          //
          //    'Slide Data' and 'Slide Charts' are prefixed on purpose. Plain
          //    'Charts' and 'Data Grid' already belong to the MUI X catalogue
          //    above, which is a component library for mocking product UI — a
          //    different thing from a slide. The prefix is what keeps the two
          //    readable in one sidebar.
          //
          //    Ordered as a deck is written: open, argue, evidence, prove, show,
          //    close.
          'Openers',
          ['Cover', 'Section Divider', 'Agenda'],
          'Narrative',
          [
            'Headline + Image',
            'Bullets + Image',
            'Feature Cards',
            'Staircase Cards',
            'Pillars',
            'Diagram',
            'Timeline',
            'Process',
            'Quote',
          ],
          'Slide Data',
          [
            'Stat Grid',
            'Column Grid',
            'Numbers',
            'Comparison',
            'Tint Table',
            'Financial Table',
            'Use of Funds',
            'Data Grid',
            'KPI Board',
          ],
          'Slide Charts',
          ['Headline + Chart', 'Chart Hero', 'Chart Duo', 'Chart Stack', 'Chart + Stats'],
          'People',
          ['Team Grid', 'Team Row', 'Logo Wall'],
          'Showcase',
          ['Full Bleed', 'Device Showcase'],
          // Statement sits here rather than with the openers: it is the
          // full-slide declarative sentence, used far more to land a deck than
          // to open one.
          'Closing',
          ['Statement', 'Closing'],
          '*',
        ],
      },
    },
  },
  initialGlobals: { backgrounds: { value: 'white' } },
}

export default preview
