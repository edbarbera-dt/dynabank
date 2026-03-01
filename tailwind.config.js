/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EEF6FF",
          100: "#D9EBFF",
          200: "#BBD9FF",
          300: "#8CC2FF",
          400: "#559FFF",
          500: "#1A73E8",
          600: "#0C5DC7",
          700: "#0A4BA2",
          800: "#0E3F86",
          900: "#12376E",
          950: "#0F172A",
        },
        success: {
          50: "#F0FDF4",
          500: "#22C55E",
          600: "#16A34A",
        },
        danger: {
          50: "#FEF2F2",
          500: "#EF4444",
          600: "#DC2626",
        },
        warning: {
          50: "#FFFBEB",
          500: "#F59E0B",
        },
        neutral: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};

