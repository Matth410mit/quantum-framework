/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#a32035',
        'title': '#1f2937',
        'text-light': '#6b7280',
        'bg-light': '#f3f4f6',
        'bg-lighter': '#f9fafb',
      },
      fontFamily: {
        sans: ['Ubuntu', 'Helvetica', 'sans-serif'],
        'open-sans': ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
