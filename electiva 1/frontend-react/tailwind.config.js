/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        granizado: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c'
        },
        lima: {
          500: '#84cc16'
        },
        mora: {
          500: '#a855f7'
        }
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};
