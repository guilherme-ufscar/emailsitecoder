/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e8ecf5',
          100: '#c5ceea',
          200: '#9eaedd',
          300: '#778dcf',
          400: '#5a74c5',
          500: '#3d5bbb',
          600: '#3453ae',
          700: '#28489e',
          800: '#1c3d8e',
          900: '#031D5B',
          950: '#021548',
        },
      },
    },
  },
  plugins: [],
}
