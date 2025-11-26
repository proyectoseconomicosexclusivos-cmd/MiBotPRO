/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0052cc',
          '50': '#e6f0ff',
          '100': '#ccdfff',
          '200': '#99c0ff',
          '300': '#66a0ff',
          '400': '#3380ff',
          '500': '#0052cc',
          '600': '#004ab3',
          '700': '#00388a',
          '800': '#002660',
          '900': '#001436',
        },
        secondary: '#42526E',
        accent: '#FFAB00',
        light: '#F4F5F7',
      }
    },
  },
  plugins: [],
}
