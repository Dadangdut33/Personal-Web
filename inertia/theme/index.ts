'use client'

import { createTheme } from '@mantine/core'

export const theme = createTheme({
  fontFamily:
    'Geist, Open Sans, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  fontFamilyMonospace: 'Geist Mono, monospace',
  white: '#cdf6fe',
  primaryColor: 'lime',
  focusRing: 'always',
  radius: { xs: '5px' },
  defaultRadius: 'xs',
  shadows: {
    md: '4px 4px 0px 0px #000',
  },
})
