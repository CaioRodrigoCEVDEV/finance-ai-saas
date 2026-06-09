/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          400: '#38bdf8',
          500: '#0ea5e9',
          900: '#082f49'
        }
      },
      boxShadow: {
        glow: '0 0 40px rgba(14, 165, 233, 0.18)'
      }
    }
  },
  plugins: []
};
