/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",     // blue-600
        secondary: "#1E40AF",   // blue-800
        accent: "#22C55E",      // green-500
        muted: "#64748B",       // slate-500
        bg: "#F8FAFC",          // slate-50
        card: "#FFFFFF",
      },
      boxShadow: {
        soft: "0 10px 25px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [],
};
