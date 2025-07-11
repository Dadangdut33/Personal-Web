'use client'

import { generateColors } from '@mantine/colors-generator'
import { createTheme } from '@mantine/core'

const dark = generateColors('oklch(27.11% 0.0303 225.38)')
export const theme = createTheme({
  fontFamily:
    'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  headings: {
    fontFamily:
      'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  },
  white: '#cdf6fe',
  primaryColor: 'lime',
  colors: {
    dark,
  },
  focusRing: 'always',
  radius: { xs: '5px' },
  defaultRadius: 'xs',
  shadows: {
    md: '4px 4px 0px 0px #000',
  },
})
