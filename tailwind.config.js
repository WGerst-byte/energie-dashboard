/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        solar: {
          light: '#fef08a',
          DEFAULT: '#eab308',
          dark: '#ca8a04',
        },
        battery: {
          light: '#bfdbfe',
          DEFAULT: '#3b82f6',
          dark: '#1d4ed8',
        },
        heat: {
          light: '#fed7aa',
          DEFAULT: '#f97316',
          dark: '#ea580c',
        },
        water: {
          light: '#a5f3fc',
          DEFAULT: '#06b6d4',
          dark: '#0891b2',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
