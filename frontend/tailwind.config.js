/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          background: '#1A1B2E',
          hover: '#252942',
          accent: '#6366F1',
        },
      },
    },
  },
  plugins: [],
}
