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
        'darkgray': '#353535',
      },
      fontFamily: {
        'title': ['Title', 'serif'],
        'normal': ['Libre Caslon Text', 'serif'],
        'poppins': ['Poppins', 'sans-serif']
      },
      animation: {
        slowPulse: 'pulse 3s infinite',
        fastPulse: 'pulse 0.75s infinite',
      },
      screens: {
        '-2xl': { max: '1535px' },
        // => @media (max-width: 1535px) { ... }

        '-xl': { max: '1279px' },
        // => @media (max-width: 1279px) { ... }

        '-lg': { max: '1023px' },
        // => @media (max-width: 1023px) { ... }

        '-md': { max: '767px' },
        // => @media (max-width: 767px) { ... }

        '-sm': { max: '639px' },
        // => @media (max-width: 639px) { ... }
      },
    }
  },
  plugins: []
};