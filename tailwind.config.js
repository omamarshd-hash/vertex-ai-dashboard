/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: "#00c9a7",
          blue: "#0066ff",
          dark: "#0a1628",
          darker: "#0d2d3a",
          forest: "#0a2518",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
}