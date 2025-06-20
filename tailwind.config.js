module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0D4B6E',
        secondary: '#1A7CA5',
        accent: '#FFC107',
        light: '#F5F9FC',
        dark: '#0A2E46',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
