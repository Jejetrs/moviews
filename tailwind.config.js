/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navbar: '#04122A',
        body: '#06214F',
        dropdown: '#05142D',
        icon: '#5E6C84',
        buttonred: '#B60D0D',
        buttonpurple: '#3C32A9',
      },
      textShadow: {
        'default': '2px 2px 4px rgba(0, 0, 0, 0.25)',  // Shadow default
        'lg': '3px 3px 6px rgba(0, 0, 0, 0.30)',        // Shadow besar
        'gray': '2px 2px 4px rgba(107, 114, 128, 0.5)', // Shadow abu-abu
        'center': '0px 0px 4px rgba(0, 0, 0, 0.5)',     // Shadow rata di semua sisi
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.text-shadow': {
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.25)',
        },
        '.text-shadow-lg': {
          textShadow: '3px 3px 6px rgba(0, 0, 0, 0.30)',
        },
        '.text-shadow-gray': {
          textShadow: '2px 2px 4px rgba(107, 114, 128, 0.5)', // Shadow abu-abu
        },
        '.text-shadow-center': {
          textShadow: '0px 0px 4px rgba(0, 0, 0, 0.5)', // Shadow di tengah, merata ke semua sisi
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ]
}
