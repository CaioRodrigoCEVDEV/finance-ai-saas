/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b'
        }
      },
      boxShadow: {
        glow: '0 18px 40px rgba(15, 23, 42, 0.08)',
        soft: '0 12px 30px rgba(15, 23, 42, 0.06)'
      },
      maxWidth: {
        content: '1440px'
      }
    }
  },
  plugins: []
};
