module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // primary/secondary are objects so `bg-primary`, `bg-primary-dark` and
        // `bg-primary-light` all emit rules. `bg-primary-dark` was used 18 times
        // and `text-primary-dark` twice against a flat string token, which Tailwind
        // silently compiled to nothing — every one of those hover states was inert.
        primary: {
          DEFAULT: '#0D4B6E',
          dark: '#0A3A56',
          light: '#1A6E9E',
        },
        secondary: {
          DEFAULT: '#1A7CA5',
          dark: '#146384',
          light: '#3D9CC4',
        },
        accent: {
          DEFAULT: '#FFC107',
          dark: '#D9A106',
          light: '#FFD149',
        },
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
