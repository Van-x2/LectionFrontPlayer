/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'text': '#353535',
        'background': '#ffffff',
        'primary': '#1e5167',
        'secondary': '#d6c6a8',
        'accent': '#99b2bd',
        'gray1': '#efefef',
        'gray2': '#d9d9d9',
        'darkred': '#5f1111',
      },
      fontFamily: {
        'title': ['Libre Caslon Text', 'serif'],
        'normal': ['Libre Caslon Text', 'serif'],
      }
    }
  },
  plugins: []
};