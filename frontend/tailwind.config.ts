import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ["var(--font-syne)", "sans-serif"],
        dm: ["var(--font-dm-sans)", "sans-serif"],
      },
      colors: {
        bg: "#06080f",
        surface: "#0d1120",
        surface2: "#141929",
        accent: "#ff4d1c",
        accent2: "#ff8c42",
        gold: "#f5c842",
        cyan: "#00d4ff",
        muted: "#7a82a0",
      },
      animation: {
        pulse2: "pulse2 2s ease-in-out infinite",
        drift1: "drift1 12s ease-in-out infinite",
        drift2: "drift2 15s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
        fadeUp: "fadeUp 0.7s forwards",
      },
      keyframes: {
        pulse2: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.4)", opacity: "0.7" },
        },
        drift1: {
          "0%, 100%": { transform: "translate(0,0)" },
          "50%": { transform: "translate(40px, 30px)" },
        },
        drift2: {
          "0%, 100%": { transform: "translate(0,0)" },
          "50%": { transform: "translate(-30px, -40px)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
