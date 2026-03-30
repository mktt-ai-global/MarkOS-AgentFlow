import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        agentflow: {
          blue: "#2563EB",
          ink: "#18181b",
          mist: "rgba(218, 218, 224, 0.58)"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
