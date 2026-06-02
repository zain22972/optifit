/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdfbf7',
          100: '#fcf7eb',
          200: '#f7ebce',
          300: '#f2dfb1',
          400: '#e7c577',
          500: '#dcaa3d',
          600: '#c69937',
          700: '#a57f2e',
          800: '#846625',
          900: '#6c531e',
        },
        fashion: {
          dark: '#0B0F19',
          cardDark: 'rgba(17, 24, 39, 0.7)',
          cardLight: 'rgba(255, 255, 255, 0.7)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
