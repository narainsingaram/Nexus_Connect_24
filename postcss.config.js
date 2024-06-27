// postcss.config.js
module.exports = {
    plugins: [
      require('tailwindcss'),
      require('autoprefixer'),
      require('flowbite/plugin')
      // other plugins as needed
    ],
    content: [
      "./node_modules/flowbite/**/*.js"
  ],
  };
  