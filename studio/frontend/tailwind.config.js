/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#0b1120",
        },
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
      boxShadow: {
        card: "0 12px 24px -16px rgba(15, 23, 42, 0.4)",
      },
    },
  },
  plugins: [],
}

