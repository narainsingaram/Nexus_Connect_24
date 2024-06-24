/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Specify the paths to all of the template files in your project
    './src/**/*.{html,js,ts,jsx,tsx}', // Adjust according to your project structure
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class', // or 'media' if you prefer
  plugins: [],
};
