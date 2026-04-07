/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./web/index.html",
    "./web/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0b0f14',
          card: '#111827',
          border: '#1f2937',
        },
        accent: '#00ff9c',
      }
    },
  },
  plugins: [],
}
