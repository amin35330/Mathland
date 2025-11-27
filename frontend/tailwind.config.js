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
        sans: ['Vazirmatn', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        accent: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s infinite',
        'wander-1': 'wander1 20s infinite alternate ease-in-out',
        'wander-2': 'wander2 25s infinite alternate-reverse ease-in-out',
        'wander-3': 'wander3 30s infinite linear',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.5))' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.8))' },
        },
        wander1: {
          '0%': { transform: 'translate(0, 0) rotate(0deg) scale(1)' },
          '33%': { transform: 'translate(100px, -50px) rotate(10deg) scale(1.1)' },
          '66%': { transform: 'translate(-50px, 100px) rotate(-5deg) scale(0.9)' },
          '100%': { transform: 'translate(-20px, -20px) rotate(5deg) scale(1)' },
        },
        wander2: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-80px, -40px) scale(1.2)' },
          '100%': { transform: 'translate(50px, 60px) scale(0.9)' },
        },
        wander3: {
          '0%': { transform: 'rotate(0deg) translate(0,0)' },
          '50%': { transform: 'rotate(180deg) translate(50px, 50px)' },
          '100%': { transform: 'rotate(360deg) translate(0,0)' },
        }
      }
    },
  },
  plugins: [],
}