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
        /* NOTE: brand palette derived from the MehzHaya logo.
           Names are kept (emerald/gold/beige) so existing classes adopt the
           new brand colors automatically:
             emerald → warm espresso brown (primary / dark surfaces)
             gold    → camel gold (crescent accent)
             beige   → cream (light backgrounds)
           plus blush (abaya) & sage (leaves) as supporting accents. */
        emerald: {
          DEFAULT: "#5b4636",
          50: "#f7f2ec",
          100: "#ece1d2",
          200: "#dcc7ad",
          300: "#c7a883",
          400: "#ad8860",
          500: "#8f6c4a",
          600: "#735439",
          700: "#5b4636",
          800: "#46362a",
          900: "#382b20",
          950: "#241a12",
        },
        gold: {
          DEFAULT: "#c19a5b",
          light: "#dcbd87",
          dark: "#8f6f37",
        },
        beige: {
          DEFAULT: "#efe5d6",
          light: "#faf6ef",
          dark: "#e5d6c2",
        },
        blush: {
          DEFAULT: "#e6c7bd",
          dark: "#cf9f93",
        },
        sage: {
          DEFAULT: "#9aa07c",
          dark: "#7f8663",
        },
        ink: "#352a20",
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "serif"],
        sans: ['"Poppins"', "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.08)",
        gold: "0 4px 20px rgba(193,154,91,0.30)",
        glass: "0 8px 32px rgba(91,70,54,0.15)",
      },
      backgroundImage: {
        "hero-pattern":
          "linear-gradient(135deg, rgba(56,43,32,0.85) 0%, rgba(56,43,32,0.4) 100%)",
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
