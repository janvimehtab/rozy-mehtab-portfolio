/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          dark: '#131118',
          surface: '#1c1924'
        },
        editorial: {
          cream: '#fdfbf7',
          warm: '#f7f4ee',
          border: '#e8e2d9',
          text: '#1a181b',
          muted: '#66606d'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        display: ['Syne', 'Bebas Neue', 'Outfit', 'sans-serif'],
        script: ['Playfair Display', 'Caveat', 'serif']
      }
    },
  },
  plugins: [],
}
