const defaultTheme = require('tailwindcss/defaultTheme')
const theme = require('./ui.config.json')

module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class', // or 'media' or 'class'
  important: true, // important in prod is must be,
  mode: 'jit',
  theme: {
    extend: {
      fontFamily: {
        sans: [theme.fontFamily.sans, ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: {
          ...theme.colors.primary,
        },
        secondary: {
          ...theme.colors.secondary,
        },
        accent: {
          ...theme.colors.accent,
        },
        info: theme.colors.info,
        warning: theme.colors.warning,
        success: theme.colors.success,
        error: theme.colors.error,
      },
    },
    variants: {
      extend: {},
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
}
