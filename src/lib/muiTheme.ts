import { createTheme } from '@mui/material/styles'
// Module augmentation. Without these two imports the MuiChartsAxis / MuiDataGrid
// keys below are rejected as unknown theme components — the theme still WORKS at
// runtime, but TypeScript cannot see the keys, so it is the type layer that
// needs them rather than the styling layer.
import type {} from '@mui/x-charts/themeAugmentation'
import type {} from '@mui/x-data-grid/themeAugmentation'
import { color, radius, type as typeTokens } from '../tokens/tokens.js'

/**
 * The MUI theme, driven from our own tokens.
 *
 * MUI X Charts and Data Grid both read `@mui/material`'s theme, so without this
 * every chart and grid renders in MUI's default blue and Roboto — visibly
 * off-brand next to a slide. Mapping the theme once means a chart dropped on a
 * slide is on-brand by default rather than by remembering to pass colours.
 *
 * Deliberately partial: only the parts these two libraries actually consult
 * (palette, typography, shape, and a few component defaults). This is not an
 * attempt to theme all of Material UI — nothing else in this repo uses it.
 */
const series = color.series as string[]

export const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: color.accent as string, dark: color.accentDeep as string },
    secondary: { main: series[1] },
    text: {
      primary: color.text as string,
      secondary: color.textCool as string,
      disabled: color.textSubtle as string,
    },
    background: {
      default: color.surface as string,
      paper: color.surface as string,
    },
    divider: color.border as string,
  },

  typography: {
    fontFamily: typeTokens.fontFamily,
    // Chart tick labels and grid cells both land near these sizes, and both
    // sit inside a 1280x720 artboard, so they are px rather than rem — a rem
    // would be relative to a root font size the slide does not control.
    fontSize: typeTokens.scale.bodySm.size,
    button: { textTransform: 'none', fontWeight: typeTokens.weights.semibold },
  },

  shape: { borderRadius: radius.card },

  components: {
    /* Series colours. MUI X does NOT derive these from `palette.primary` — it
     * ships its own `blueberryTwilight` palette, which is why an unthemed chart
     * comes out MUI blue no matter what the palette says. Setting `colors` on
     * the data provider is what actually brands every chart type at once. */
    MuiChartsDataProvider: {
      defaultProps: { colors: series },
    },

    /* Chart axis, gridline and legend styling is NOT set here.
     *
     * MUI X v9's theme augmentation exposes only a `root` slot for
     * MuiChartsAxis and MuiChartsLegend — the per-slot keys (line, tick,
     * tickLabel, label) are not themeable, so they have to be applied per chart
     * via `sx`. SlideChart does exactly that, using the same tokens. The win
     * from this theme is palette and typography, which every MUI X component
     * does read. */
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: `1px solid ${color.border}`,
          borderRadius: radius.card,
          fontSize: typeTokens.scale.bodySm.size,
        },
        columnHeaders: {
          borderBottom: `1px solid ${color.border}`,
        },
        columnHeaderTitle: {
          fontWeight: typeTokens.weights.bold,
        },
        cell: {
          borderColor: color.border as string,
        },
      },
    },
  },
})

/** Palette handed to charts that want the full brand series in order. */
export const chartSeriesColors = series
