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
        'glow-dark': '0 18px 40px rgba(0, 0, 0, 0.3)',
        soft: '0 12px 30px rgba(15, 23, 42, 0.06)',
        'soft-dark': '0 12px 30px rgba(0, 0, 0, 0.2)'
      },
      maxWidth: {
        content: '1600px'
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'progress-fill': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' }
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
        shimmer: 'shimmer 2s infinite',
        'progress-fill': 'progress-fill 1s ease-out forwards',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
