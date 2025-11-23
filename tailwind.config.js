/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00D9FF',
          purple: '#B620E0',
          cyan: '#00FFFF',
          pink: '#FF006E',
        },
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #00D9FF, #B620E0)',
        'gradient-dark': 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
