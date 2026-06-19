/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#16a34a",
          foreground: "hsl(var(--primary-foreground))",
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          955: '#052e16',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: "#f8fafc", 
          100: "#f1f5f9", 
          200: "#e2e8f0", 
          300: "#cbd5e1",
          400: "#94a3b8", 
          500: "#64748b", 
          600: "#475569", 
          700: "#334155"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: { 50: "#f0fdf4", 100: "#dcfce7", 500: "#22c55e", 600: "#16a34a" },
        danger: { 50: "#fef2f2", 100: "#fee2e2", 500: "#ef4444", 600: "#dc2626" },
        warning: { 50: "#fffbeb", 100: "#fef3c7", 500: "#f59e0b", 600: "#d97706" },

        // GROCERY SHOP UI Custom Colors
        "background-light": "#fdfdfd",
        "surface-light": "#ffffff",
        "card-light": "#ffffff",
        "border-light": "#e2e8f0",
        "text-light": "#0f172a",
        "text-muted-light": "#64748b",
        "background-dark": "#0b0b1e",
        "surface-dark": "#13132e",
        "card-dark": "#161638",
        "border-dark": "#1e1e3f",
        "text-dark": "#f8fafc",
        "text-muted-dark": "#94a3b8",

        // Centralized colors mapping
        brand: {
          primary: '#16a34a',
          primaryHover: '#15803d',
          accent: '#f97316',
          accentHover: '#ea580c',
          yellow: '#f59e0b',
          darkStart: '#0b0b1e',
          darkEnd: '#13132e',
          glass: 'rgba(25, 25, 55, 0.45)',
          glassBorder: 'rgba(255, 255, 255, 0.08)',
        }
      },
      fontFamily: {
        body: ['Inter', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glow: '0 0 20px rgba(22, 163, 74, 0.5)',
        "glow-orange": '0 0 20px rgba(249, 115, 22, 0.35)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(60px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          from: { opacity: "0", transform: "translateY(-60px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-left": {
          from: { opacity: "0", transform: "translateX(80px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "fade-right": {
          from: { opacity: "0", transform: "translateX(-80px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-up": {
          from: { opacity: "0", transform: "scale(0.8)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "blur-in": {
          from: { opacity: "0", filter: "blur(20px)", transform: "scale(1.1)" },
          to: { opacity: "1", filter: "blur(0)", transform: "scale(1)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(22, 163, 74, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(22, 163, 74, 0.5)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-down": "fade-down 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-left": "fade-left 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-right": "fade-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-up": "scale-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "blur-in": "blur-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "float": "float 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      }
    },
  },
  plugins: [],
}
