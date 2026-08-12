import '../src/css/app.css'

/** @type { import('@storybook/vue3-vite').Preview } */
const preview = {
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      options: {
        // The default is the mid grey a slide is reviewed against, so the
        // white edge of the artboard stays visible.
        stage: { name: 'stage', value: '#e8eaed' },
        white: { name: 'white', value: '#ffffff' },
        dark: { name: 'dark', value: '#202020' },
      },
    },
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    options: {
      // Layout taxonomy: Foundations, then the elements slides are built
      // from, then the templates themselves. Real rebuilt slides live as
      // stories under the template whose layout they use.
      storySort: {
        order: [
          'Getting Started',
          'Foundations', [
            'Colors', 'Typography', 'Icons', 'Logos',
            'Grid & Safe Areas', 'Charts', 'Imagery', 'Gradients',
          ],
          'Elements', [
            'Text', 'Data', 'Media', 'Layout', 'Brand',
          ],
          'Templates', [
            'Cover', 'Section Divider', 'Statement',
            'Headline + Image', 'Headline + Chart', 'Stat Grid',
            'Feature Cards', 'Comparison', 'Data Table',
            'Team', 'Logo Wall', 'Diagram',
            'Full Bleed', 'Device Showcase', 'Closing',
          ],
          '*',
        ],
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: 'stage' },
  },
}

export default preview
