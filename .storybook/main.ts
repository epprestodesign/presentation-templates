import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  docs: {},
  staticDirs: ['../src/assets'],

  /* GitHub Pages serves this as a PROJECT site, from /presentation-templates/
   * rather than from the domain root. Storybook emits absolute asset paths, so
   * without a matching base the deployed page asks for /assets/... , receives
   * the 404 page, and renders a blank white screen — no console error, nothing
   * that looks like a failure. The workflow sets STORYBOOK_BASE_PATH; locally it
   * is unset and the base stays '/', which is what dev needs. */
  viteFinal: async (viteConfig) => {
    const base = process.env.STORYBOOK_BASE_PATH
    if (base) viteConfig.base = base
    return viteConfig
  },
}

export default config
