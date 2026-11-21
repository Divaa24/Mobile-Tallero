/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        tallero: {
          navy: "#013C58",
          dark: "#012436",
          teal: "#00537A",
          sky: "#A8E8F9",
          amber: "#F5A201",
          yellow: "#FFD166",
        },
      },
    },
  },
  plugins: [],
};