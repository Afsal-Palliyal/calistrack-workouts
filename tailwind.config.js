/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0f1d',
        surface: '#171e2e',
        surfaceHover: '#222b40',
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        accent: '#8b5cf6',
        text: '#f8fafc',
        textMuted: '#94a3b8',
        border: '#1e293b'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
