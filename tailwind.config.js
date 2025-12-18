/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8', // Ali Farm Brand Blue
          800: '#1e40af',
          900: '#1e3a8a',
        },
        agri: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e', // Agriculture Green
          600: '#16a34a',
          700: '#15803d',
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'bounce-slow': 'bounce 3s infinite',
        'scale-slow': 'scaleSlow 20s linear infinite alternate',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleSlow: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.15)' },
        }
      }
    },
  },
  plugins: [],
}