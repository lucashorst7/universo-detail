/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FBF8EE', 100: '#F5EFD3', 200: '#EBE0A8', 300: '#E0CC7A',
          400: '#D4B84F', 500: '#C5A637', 600: '#A88A2C', 700: '#826A24',
          800: '#5C4B1A', 900: '#3D3211',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
