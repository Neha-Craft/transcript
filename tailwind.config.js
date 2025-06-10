/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./component/**/*.{js,ts,jsx,tsx}",
  ],
  important: true,
  theme: {
    extend: {
      fontFamily: {
        soraLight: ["Sora-Light", "sans-serif"],
      },
      colors: {
        primary: 'rgb(97 81 213)',
         customPurple: "rgb(97 81 213)",
      },
      fontSize: {
        xxl: "5rem",
      },
    },
  },
  plugins: [],
};

