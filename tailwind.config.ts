import type { Config } from "tailwindcss";

export default {
  darkMode: "class",

  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },

    extend: {
      colors: {
        vp: {
          // Light (default) — basado en vplanet.co
          bg: "#F7FAFF",
          panel: "#FFFFFF",
          border: "#E2E8F0",
          text: "#0F172A",
          muted: "#64748B",

          primary: "#2E6FB5",
          primary2: "#1F4F85",
          soft: "#EAF2FF",

          success: "#16A34A",
          warning: "#F59E0B",
          danger: "#EF4444",

          // Dark (cuando pongas class="dark" en <html> o <body>)
          dark: {
            bg: "#0B1220",
            panel: "#0F1A2B",
            border: "#1C2A44",
            text: "#D7E3F4",
            muted: "#93A4BD",
            primary: "#60A5FA",
            primary2: "#3B82F6",
            soft: "#0B1D36",
          },
        },
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
        soft2: "0 6px 18px rgba(15, 23, 42, 0.10)",
        vp: "0 10px 25px rgba(0,0,0,0.25)", // lo dejo por compatibilidad si lo usabas
      },

      borderRadius: {
        xl2: "1rem",
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },

      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
        slideUp: "slideUp 0.3s ease-out",
      },
    },
  },

  plugins: [],
} satisfies Config;