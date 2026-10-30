/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cream: '#FAF7F2',
        peach: '#E9A38F',
        sage: '#A8B5A0',
        brown: '#51463F',
        beige: '#E8DED4',
        charcoal: '#252A2A',
        greenGray: '#303A37',
      },
    },
  },
  plugins: [],
}
