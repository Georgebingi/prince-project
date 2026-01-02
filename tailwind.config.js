
/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1e3a8a", // blue-900
          foreground: "#ffffff",
          hover: "#172554", // blue-950
        },
        secondary: {
          DEFAULT: "#475569", // slate-600
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#0f766e", // teal-700
          foreground: "#ffffff",
        },
        danger: {
          DEFAULT: "#dc2626", // red-600
          foreground: "#ffffff",
        },
        background: "#f8fafc", // slate-50
        surface: "#ffffff",
        border: "#e2e8f0", // slate-200
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
