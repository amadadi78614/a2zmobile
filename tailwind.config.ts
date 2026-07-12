import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FFD400",
          50: "#FFFBEB",
          100: "#FFF3C4",
          400: "#FFE066",
          500: "#FFD400",
          600: "#E6BF00",
          700: "#B39400",
        },
        secondary: {
          DEFAULT: "#D61F26",
          50: "#FDECEC",
          400: "#E14A50",
          500: "#D61F26",
          600: "#B01319",
          700: "#8A0F14",
        },
        ink: {
          DEFAULT: "#111111",
          800: "#1C1C1C",
          700: "#2A2A2A",
          500: "#4A4A4A",
          400: "#6B6B6B",
        },
        paper: "#FFFFFF",
        mist: "#F7F7F7",
        line: "#E8E8E8",
      },
      fontFamily: {
        display: ["var(--font-poppins)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      boxShadow: {
        card: "0 1px 2px rgba(17,17,17,0.04), 0 8px 24px -12px rgba(17,17,17,0.10)",
        cardHover: "0 4px 8px rgba(17,17,17,0.06), 0 16px 40px -14px rgba(17,17,17,0.16)",
        premium: "0 20px 60px -20px rgba(17,17,17,0.35)",
      },
      maxWidth: {
        content: "1440px",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        fadeUp: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
