'use client';

import RingLoader from '@/components/Loader/RingLoader';
import { generateColors } from '@mantine/colors-generator';
import { createTheme, Loader } from '@mantine/core';

const gray = generateColors('#696969');
export const theme = createTheme({
  fontFamily: 'DM Sans, Public Sans, sans-serif',
  headings: { fontFamily: 'DM Sans, Public Sans, sans-serif' },
  white: '#fef2e8',
  primaryColor: 'lime',
  colors: {
    dark: [
      '#f0f5fa',
      '#e1e8ed',
      '#becfdd',
      '#97b5cd',
      '#789fc0',
      '#588ab5',
      '#3d6a8f',
      '#204059',
      '#6491b8',
      '#2e5c80',
    ],
    gray,
  },
  focusRing: 'always',
  radius: { md: '5px' },
  defaultRadius: 'md',
  shadows: {
    md: '4px 4px 0px 0px #000',
  },
  components: {
    Loader: Loader.extend({
      defaultProps: {
        loaders: { ...Loader.defaultLoaders, ring: RingLoader },
        type: 'ring',
      },
    }),
  },
});
