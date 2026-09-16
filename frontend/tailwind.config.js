/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fff3ed',
          100: '#ffe4d6',
          200: '#ffc5ab',
          300: '#ff9a73',
          400: '#ff6233',
          500: '#ff4500',
          600: '#e63200',
          700: '#cc2200',
          800: '#a31d00',
          900: '#831c04',
          950: '#470a00',
        },
        cyber: {
          500: '#ff4500',
          600: '#e63200',
          700: '#cc2200',
        },
        dark: {
          bg: '#090d16',
          surface: '#0f172a',
          card: 'rgba(15, 23, 42, 0.75)',
          border: 'rgba(255, 255, 255, 0.08)',
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #ff4500 0%, #ff2a4b 50%, #e6005c 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
      boxShadow: {
        'pro-light': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'pro-dark': '0 12px 35px -8px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'blob': 'blob 10s infinite',
        'float': 'float 7s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      }
    },
  },
  plugins: [],
}
