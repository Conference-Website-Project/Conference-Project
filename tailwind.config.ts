import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        academic: {
          navy: "#0f172a",
          blue: "#1e3a8a",
          royal: "#1d4ed8",
          slate: "#475569",
          muted: "#64748b",
          light: "#f8fafc",
          border: "#e2e8f0",
          accent: "#991b1b", // Crimson
          gold: "#b45309",   // Warm Academic Amber/Gold
          goldLight: "#fef3c7",
        },
      },
      fontFamily: {
        serif: ["Merriweather", "Georgia", "Cambria", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)",
        card: "0 4px 6px -1px rgba(15, 23, 42, 0.04), 0 2px 4px -2px rgba(15, 23, 42, 0.03)",
        dropdown: "0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
