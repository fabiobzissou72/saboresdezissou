/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cream': '#F5F5DC',
        'wine': '#722F37',
        'wine-light': '#8B4C58',
        'pink-soft': '#F4C2C2',
        'chocolate': '#7B3F00',
        'chocolate-light': '#A0522D',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xl-custom': '1.375rem',
        '2xl-custom': '1.625rem',
      }
    },
  },
  plugins: [],
}