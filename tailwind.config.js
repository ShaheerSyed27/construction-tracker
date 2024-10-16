// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Ensure all relevant file types are included
    "./app/**/*.{js,ts,jsx,tsx}", // Include the `app` directory if using it
  ],
  theme: {
    extend: {
      colors: {
        'custom-gray': '#2d2d2d', // Dark gray for better readability
      },
    },
  },
  plugins: [],
};
