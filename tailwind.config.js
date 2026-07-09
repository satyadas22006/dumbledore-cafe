/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        cursive: ['"Caveat"', 'cursive'],
        mono: ['"Space Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
// Add this to your Tailwind config or as a CSS module
// Gingham Pattern Style
const ginghamStyle = {
  backgroundColor: "#FFFBE6",
  backgroundImage: `
    linear-gradient(45deg, #F8E1E1 25%, transparent 25%, transparent 75%, #F8E1E1 75%, #F8E1E1),
    linear-gradient(45deg, #F8E1E1 25%, transparent 25%, transparent 75%, #F8E1E1 75%, #F8E1E1)
  `,
  backgroundPosition: "0 0, 10px 10px",
  backgroundSize: "20px 20px"
};