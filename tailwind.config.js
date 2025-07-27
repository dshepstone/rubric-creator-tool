// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        // pick whatever value you want here
        '8xl': '96rem',
      }
    },
  },
  plugins: [],
}
