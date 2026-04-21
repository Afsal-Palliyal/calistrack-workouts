/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b', // zinc-950
        surface: '#18181b', // zinc-900
        surfaceHover: '#27272a', // zinc-800
        primary: '#0ea5e9', // vivid sky blue
        primaryHover: '#0284c7',
        accent: '#c026d3', // neon fuchsia
        text: '#f8fafc',
        textMuted: '#a1a1aa',
        border: '#27272a'
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'glow': '0 0 20px rgba(14, 165, 233, 0.3)',
        'glow-accent': '0 0 20px rgba(192, 38, 211, 0.3)'
      }
    },
  },
  plugins: [],
}
