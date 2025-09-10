/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#f59e0b',
        surface: '#ffffff',
        background: '#f8fafc',
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
        info: '#0284c7',
      },
    },
  },
  plugins: [],
}