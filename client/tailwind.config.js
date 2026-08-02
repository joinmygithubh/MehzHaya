/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      screens: {
        // Mobile-first breakpoints aligned to target devices
        xs: "375px", // small phones
        // sm:640 md:768 (tablet) lg:1024 (laptop) xl:1280 are Tailwind defaults
        "3xl": "1440px", // large desktops
      },
      colors: {
        ivory: "#FBF7F1",
        champagne: "#F3E9DA",
        blush: "#F0E1DD",
        gold: {
          DEFAULT: "#B8935A",
          light: "#F3E9DA",
          dark: "#8C6B3F",
          deep: "#8C6B3F",
        },
        espresso: "#3B2F2F",
        taupe: "#7A6C60",
        sand: "#E3D5C3",
        sage: "#8FA382",
        terracotta: "#B4685A",
        // Aliases to ensure legacy or component classes resolve seamlessly to the Ivory & Gold palette
        emerald: {
          DEFAULT: "#B8935A",
          50: "#FBF7F1",
          100: "#F3E9DA",
          200: "#F0E1DD",
          300: "#E3D5C3",
          400: "#B8935A",
          500: "#B8935A",
          600: "#8C6B3F",
          700: "#8C6B3F",
          800: "#3B2F2F",
          900: "#3B2F2F",
          950: "#3B2F2F",
        },
        beige: {
          DEFAULT: "#F3E9DA",
          light: "#FBF7F1",
          dark: "#E3D5C3",
        },
        ink: "#3B2F2F",
      },
      fontFamily: {
        serif: [
          '"Cormorant Garamond"',
          "Georgia",
          "Cambria",
          '"Times New Roman"',
          "Times",
          "serif",
        ],
        sans: [
          '"Jost"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(59,47,47,0.08)",
        gold: "0 4px 20px rgba(184,147,90,0.25)",
        glass: "0 8px 32px rgba(59,47,47,0.06)",
      },
      backgroundImage: {
        "hero-pattern":
          "linear-gradient(135deg, rgba(251,247,241,0.95) 0%, rgba(243,233,218,0.8) 100%)",
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
