/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#06070A",
          900: "#08090D",
          850: "#0E1017",
          800: "#131620",
          700: "#1A1E2B",
          600: "#252B3D",
        },
        navy: {
          950: "#06070A",
          900: "#08090D",
          800: "#0E1017",
          700: "#161B26",
        },
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        status: {
          claimed: "#94A3B8",
          inferred: "#38BDF8",
          verified: "#F59E0B",
          proven: "#10B981",
          discrepancy: "#F97316",
          alert: "#EF4444",
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
