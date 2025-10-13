/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          50: '#f9f7f4',
          100: '#f0ebe3',
          200: '#e1d7c7',
          300: '#cbbea4',
          400: '#b5a482',
          500: '#9d8a66',
          600: '#8a7557',
          700: '#725f48',
          800: '#5e4f3d',
          900: '#4e4234',
        },
        plant: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        }
      }
    },
  },
  plugins: [],
}

