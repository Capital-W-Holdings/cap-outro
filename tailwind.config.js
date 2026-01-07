/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Cap Outro brand colors - dark theme with gold accents
        brand: {
          gold: '#C9A962',
          'gold-light': '#D4B978',
          'gold-dark': '#A88B4A',
        },
        dark: {
          900: '#0A0A0A',
          800: '#121212',
          700: '#1A1A1A',
          600: '#242424',
          500: '#2E2E2E',
        },
      },
    },
  },
  plugins: [],
};
