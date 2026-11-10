import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        studio: {
          bg: "#0B0F19",
          card: "#111827",
          border: "#1F2937",
          hover: "#1A2234",
          accent: "#6366F1",
          neon: "#06B6D4",
        },
      },
    },
  },
  plugins: [],
};
export default config;
