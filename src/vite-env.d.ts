/// <reference types="vite/client" />

/* Asset imports. Vite resolves these to URLs at build time; TypeScript needs
   to be told they are strings. */
declare module '*.svg' {
  const src: string
  export default src
}
declare module '*.png' {
  const src: string
  export default src
}
declare module '*.jpg' {
  const src: string
  export default src
}
declare module '*.jpeg' {
  const src: string
  export default src
}

/* The token modules are plain .js with JSDoc types (see tsconfig for why).
   These declarations give call sites the shapes without duplicating them. */
declare module '*/tokens/tokens.js' {
  export const canvas: {
    width: number
    height: number
    aspect: string
    pxPerInch: number
    inchWidth: number
    inchHeight: number
    exportScale: number
  }
  export const grid: {
    marginX: number
    marginTop: number
    marginBottom: number
    columns: number
    gutter: number
    contentWidth: number
    columnWidth: number
    chromeY: number
    titleY: number
    leadY: number
    bodyY: number
    watermarkY: number
    watermarkGutter: number
  }
  export const type: {
    fontFamily: string
    weights: Record<string, number>
    scale: Record<string, { size: number; lineHeight: number; weight: number; tracking: string }>
  }
  export const gradient: Record<string, { angle: number; from: string; to: string }>
  export const tableTint: { header: string; headerText: string; rows: string[] }
  export const color: Record<string, string | string[]>
  export const radius: { image: number; card: number; panel: number; pill: number }
  export const space: Record<string, number>
  export const shadow: Record<string, string>
  const tokens: unknown
  export default tokens
}

declare module '*/tokens/palette.js' {
  type Ramp = Record<string | number, string>
  export const orient: Ramp
  export const fountainBlue: Ramp
  export const neutral: Ramp
  export const blueGrey: Ramp
  export const palette: Record<string, Ramp>
}
