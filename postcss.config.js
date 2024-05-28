module.exports = {
  plugins: {
		'postcss-import': {},
    'tailwindcss/nesting': {},
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        // breakpoints
        "mantine-breakpoint-xs": "36em",
        "mantine-breakpoint-sm": "48em",
        "mantine-breakpoint-md": "62em",
        "mantine-breakpoint-lg": "75em",
        "mantine-breakpoint-xl": "88em",
        // spacing
        "mantine-spacing-xs": "4px",
        "mantine-spacing-sm": "8px",
        "mantine-spacing-md": "12px",
        "mantine-spacing-lg": "16px",
        "mantine-spacing-xl": "20px",
        // font size
        "mantine-font-size-xs": "12px",
        "mantine-font-size-sm": "14px",
        "mantine-font-size-md": "16px",
        "mantine-font-size-lg": "18px",
        "mantine-font-size-xl": "20px",
        // title (custom)
        "mantine-titles-size-xs": "20px",
        "mantine-titles-size-sm": "24px",
        "mantine-titles-size-md": "32px",
        "mantine-titles-size-lg": "40px",
        "mantine-titles-size-xl": "48px",
      },
    },
    tailwindcss: {},
    autoprefixer: {},
  },
};
