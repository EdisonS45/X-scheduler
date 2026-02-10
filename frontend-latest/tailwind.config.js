/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#f9fafb',
        primary: '#111827',
        muted: '#6b7280',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.04)',
        card: '0 8px 24px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
