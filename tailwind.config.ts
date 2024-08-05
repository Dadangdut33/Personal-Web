import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-mantine-color-scheme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        main: 'var(--main)',
        mainAccent: 'var(--main-accent)',
        overlay: 'var(--overlay)',

        bg: 'var(--bg)',
        text: 'var(--text)',
        border: 'var(--border)',

        darkBg: 'var(--darkBg)',
        darkText: 'var(--darkText)',
        darkBorder: 'var(--darkBorder)',

        secondaryBlack: 'var(--secondary-black)',
      },
      borderRadius: {
        base: 'var(--border-radius)',
      },
      boxShadow: {
        light: '4px 4px 0px 0px #000',
        dark: '4px 4px 0px 0px #000',
      },
      translate: {
        boxShadowX: '4px',
        boxShadowY: '4px',
        reverseBoxShadowX: '-4px',
        reverseBoxShadowY: '-4px',
      },
      fontWeight: {
        base: 'var(--base-font-weight)',
        heading: 'var(--heading-font-weight)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        marquee2: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' },
        },
      },
      animation: {
        marquee: 'marquee 5s linear infinite',
        marquee2: 'marquee2 5s linear infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
      },
      screens: {
        w900: { raw: '(max-width: 900px)' },
        w500: { raw: '(max-width: 500px)' },
        m1500: { raw: '(max-width: 1500px)' },
        m1300: { raw: '(max-width: 1300px)' },
        m1100: { raw: '(max-width: 1100px)' },
        m1000: { raw: '(max-width: 1000px)' },
        m900: { raw: '(max-width: 900px)' },
        m850: { raw: '(max-width: 850px)' },
        m800: { raw: '(max-width: 800px)' },
        m750: { raw: '(max-width: 750px)' },
        m700: { raw: '(max-width: 700px)' },
        m650: { raw: '(max-width: 650px)' },
        m600: { raw: '(max-width: 600px)' },
        m550: { raw: '(max-width: 550px)' },
        m500: { raw: '(max-width: 500px)' },
        m450: { raw: '(max-width: 450px)' },
        m400: { raw: '(max-width: 400px)' },
        m350: { raw: '(max-width: 350px)' },
      },
    },
  },
  plugins: [],
};
export default config;
