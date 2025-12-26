/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          main: "#0a0a0a",   // Deep Black
          card: "#111111",   // Slightly lighter black for cards
          border: "#333333",
        },
        trade: {
          up: "#00ff9d",     // Neon Green (Profit)
          down: "#ff4d4d",   // Neon Red (Loss)
          accent: "#2962ff", // Blue for buttons
        }
      },
      fontFamily: {
        mono: ['"Roboto Mono"', 'monospace'], // Monospace font for numbers
      }
    },
  },
  plugins: [],
}

