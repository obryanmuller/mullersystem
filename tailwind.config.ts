/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-green': '#23a383',
        'brand-dark': '#262626',
        'brand-light': '#f5f5f5',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // ADICIONE ESTA LINHA
  ],
}