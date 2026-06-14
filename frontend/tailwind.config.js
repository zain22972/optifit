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
          950: '#3d2e0e',
        },
        fashion: {
          dark: '#0B0F19',
          darker: '#060912',
          cardDark: 'rgba(17, 24, 39, 0.7)',
          cardLight: 'rgba(255, 255, 255, 0.7)',
          accent: '#8B5CF6',
          rose: '#F43F5E',
          emerald: '#10B981',
          teal: '#14B8A6',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.7)',
          lighter: 'rgba(255, 255, 255, 0.4)',
          dark: 'rgba(15, 23, 42, 0.65)',
          darker: 'rgba(15, 23, 42, 0.85)',
          border: 'rgba(255, 255, 255, 0.12)',
          'border-dark': 'rgba(255, 255, 255, 0.06)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-lg': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-xl': '0 20px 60px 0 rgba(0, 0, 0, 0.3)',
        'gold-glow': '0 0 20px rgba(220, 170, 61, 0.3)',
        'indigo-glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-dark': '0 2px 15px -3px rgba(0, 0, 0, 0.3), 0 10px 20px -2px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'scan-line': 'scanLine 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scanLine: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
