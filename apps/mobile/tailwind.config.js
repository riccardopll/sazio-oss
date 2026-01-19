/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        nutrition: {
          calories: "#2C2C2E",
          carbs: "#30D158",
          fat: "#FFD60A",
          protein: "#FF453A",
        },
        surface: {
          primary: "#F2F2F7",
          card: "rgba(255, 255, 255, 0.7)",
          elevated: "#FFFFFF",
        },
        text: {
          primary: "#1C1C1E",
          secondary: "#8E8E93",
          tertiary: "#C7C7CC",
        },
      },
    },
  },
  plugins: [],
};
