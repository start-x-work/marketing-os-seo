import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        indigo: { DEFAULT: "#5957EE", light: "#EEEEFE" },
        slate: { DEFAULT: "#0A2540", muted: "#425466" },
        border: "#E6E9EC",
        success: "#1A9D62",
        warning: "#C77700",
        danger: "#DF1B41",
      },
      fontFamily: {
        sans: ["Manrope", "Noto Sans JP", "sans-serif"],
      },
      boxShadow: {
        soft: "0 24px 80px rgba(10, 37, 64, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
