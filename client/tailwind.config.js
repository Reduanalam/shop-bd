/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Hind Siliguri"', "system-ui", "sans-serif"],
        script: ["Caveat", "cursive"],
      },
      colors: {
        // Green brand palette (was blue: 50 #eff6ff, 500 #2563eb, 600 #1d4ed8, 700 #1e40af)
        primary: {
          50: "#eef6ea",
          100: "#dcecd4",
          500: "#2f8f46",
          600: "#1f7a3a",
          700: "#175f2e",
          800: "#124b25",
          900: "#0d3a1c",
        },
        accent: { 500: "#f47b20", 600: "#e0670f" },
        ink: "#16261d",
      },
    },
  },
  plugins: [],
};
