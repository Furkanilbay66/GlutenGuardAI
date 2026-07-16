/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mint: {
          50: '#f0fdf4',
          100: '#dcfce7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        skybg: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        alertred: {
          500: '#ef4444',
          600: '#dc2626',
        },
        warnyellow: {
          400: '#fbbf24',
          500: '#f59e0b',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.15)',
        'laser-glow': '0 0 15px #38bdf8, 0 0 30px #0284c7, 0 0 45px #38bdf8',
        'safe-glow': '0 0 25px rgba(16, 185, 129, 0.4)',
        'danger-glow': '0 0 25px rgba(239, 68, 68, 0.4)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
