/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'f1-orange': '#FF5C1A',
        'f1-teal': '#00C4B4',
        'f1-yellow': '#FFD600',
        'f1-purple': '#7C3AED',
        'f1-pink': '#F43F8E',
        'f1-dark': '#0A0A0F',
        'f1-card': '#13131A',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
