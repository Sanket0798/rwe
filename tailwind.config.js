/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        card: '0 4px 10px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
};
