/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        emerald: {
          DEFAULT: "#064e3b",
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        gold: {
          DEFAULT: "#d4af37",
          light: "#e6c75a",
          dark: "#b8941f",
        },
        beige: {
          DEFAULT: "#f5f5dc",
          light: "#faf8f0",
          dark: "#e8e4d0",
        },
        ink: "#1a1a1a",
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "serif"],
        sans: ['"Poppins"', "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.08)",
        gold: "0 4px 20px rgba(212,175,55,0.25)",
        glass: "0 8px 32px rgba(6,78,59,0.12)",
      },
      backgroundImage: {
        "hero-pattern":
          "linear-gradient(135deg, rgba(6,78,59,0.85) 0%, rgba(6,78,59,0.4) 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        shimmer: "shimmer 1.5s infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
