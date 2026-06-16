/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        kore: {
          dark: '#0f0f0f',
          accent: '#8b5cf6', // Violeta moderno
          surface: '#1f1f1f',
          surfaceHover: '#2a2a2a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
