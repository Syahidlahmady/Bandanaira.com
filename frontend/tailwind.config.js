/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Nexa Pro"', '"Nexa"', 'Montserrat', '"Plus Jakarta Sans"', '-apple-system', 'sans-serif'],
        script: ['"Intro Script"', '"IntroScript"', '"Style Script"', 'cursive'],
        serif: ['"Intro Script"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        banda: {
          navy: '#081d35',
          'navy-royal': '#0f2c59',
          'navy-elevated': '#122a46',
          gold: '#f4b75e',
          amber: '#d97706',
          teal: '#173f43',
          'teal-dark': '#102f33',
          'teal-light': '#20565a',
          coral: '#e9a66f',
          'coral-light': '#f2b581',
          sand: '#b46b3c',
          cream: '#f7f5f0',
          sage: '#dce8df',
          'sage-mist': '#eaf0ed',
          earth: '#f2e8dc',
        }
      }
    },
  },
  plugins: [],
}
