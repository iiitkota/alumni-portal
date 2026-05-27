/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'max-w-1464': {'max': '1464px'},
        'max-w-980' : {'max' : '980px'},
        'max-w-492' : {'max' : '492px'},
      },
      keyframes: {
        popUp: {
            '0%': { opacity: 0, transform: 'translateY(10px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
        },
    },
    animation: {
        'pop-up': 'popUp 0.5s ease-out forwards',
    },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',  /* Internet Explorer 10+ */
          'scrollbar-width': 'none',     /* Firefox */
          '&::-webkit-scrollbar': {
            display: 'none',             /* Safari and Chrome */
          },
        },
      });
    },
  ],
}