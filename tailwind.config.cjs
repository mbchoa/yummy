/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      zIndex: {
        search: "10",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
