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
          ['Overview', 'Basics'],
          // 3) Elements — the pieces a slide is assembled from
          'Elements',
          ['Text', 'Data', 'Media', 'Layout', 'Brand'],
          // 4) Templates — the slide archetypes, with real rebuilt slides as
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
            'Use of Funds',
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
