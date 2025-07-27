<<<<<<< HEAD
/** @type {import('tailwindcss').Config} */
module.exports = {
  // ← tell Tailwind which files to scan for class names
=======
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
>>>>>>> logo-insertion
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
<<<<<<< HEAD
    extend: {},
  },
  plugins: [],
}


=======
    extend: {
      maxWidth: {
        // pick whatever value you want here
        '8xl': '96rem',
      }
    },
  },
  plugins: [],
}
>>>>>>> logo-insertion
