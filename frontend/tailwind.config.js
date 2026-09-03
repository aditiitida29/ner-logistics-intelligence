/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          dark: '#0B132B',
          navy: '#1C2541',
          slate: '#3A506B',
          accent: '#0066CC',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#EF4444',
          subtle: '#F1F5F9'
        }
      }
    },
  },
  plugins: [],
}
