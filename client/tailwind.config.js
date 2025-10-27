/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          primary: '#FF9324',
          secondary: '#e99a4b',
          light: '#FFB366',
          dark: '#E67E00',
        },
        background: {
          primary: '#FAFAFA', // Off-white
          secondary: '#FFFFFF', // Pure white
        }
      }
    },
  },
  plugins: [],
}