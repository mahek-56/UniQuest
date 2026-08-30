/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFAF3',
          100: '#FFF2DB',
          200: '#FFE5BF',
        },
        brand: {
          pink: '#FF0052',
          gold: '#FFD400',
          green: '#00C68D',
          blue: '#0055DA',
          dark: '#36064D',
          paper: '#F7F6E5',
          cyan: '#76D2DB',
          red: '#DA4848',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #36064D',
        'brutal-lg': '6px 6px 0px 0px #36064D',
        'brutal-sm': '2px 2px 0px 0px #36064D',
        'brutal-hover': '2px 2px 0px 0px #36064D',
        'brutal-pink': '4px 4px 0px 0px #FF0052',
        'brutal-gold': '4px 4px 0px 0px #FFD400',
        'brutal-blue': '4px 4px 0px 0px #0055DA',
        'brutal-green': '4px 4px 0px 0px #00C68D',
        'card-soft': '0 10px 30px -5px rgba(54, 6, 77, 0.08)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        bounceSlight: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'bounce-slight': 'bounceSlight 1.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
