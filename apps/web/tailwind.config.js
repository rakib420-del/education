/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary — Deep Navy (Trust / Education)
        primary: {
          50:  '#e8f0f7',
          100: '#c5d8ec',
          200: '#9dbde0',
          300: '#74a2d3',
          400: '#4d88c7',
          500: '#2a6fbb',
          600: '#1c5a9e',
          700: '#134680',
          800: '#0f3d5c', // ← main brand color
          900: '#0a2d47',
        },
        // Accent — Warm Amber / Coral (CTAs)
        accent: {
          50:  '#fff5ee',
          100: '#ffe5cc',
          200: '#ffcfa0',
          300: '#ffb374',
          400: '#ff9550',
          500: '#ff7a45', // ← main CTA color
          600: '#e8612a',
          700: '#cc4b16',
          800: '#b03c0a',
          900: '#8a2d03',
        },
        // Neutral
        surface: {
          DEFAULT: '#0d1117',
          card:    '#161b22',
          hover:   '#21262d',
          border:  '#30363d',
        },
      },
      fontFamily: {
        bangla: ['"Hind Siliguri"', '"Noto Sans Bengali"', 'sans-serif'],
        sans:   ['"Inter"', '"Hind Siliguri"', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0f3d5c 0%, #1c5a9e 50%, #0a2d47 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(15,61,92,0.0) 0%, rgba(15,61,92,0.8) 100%)',
        'accent-gradient': 'linear-gradient(135deg, #ff7a45 0%, #e8612a 100%)',
      },
      animation: {
        'fade-up':   'fadeUp 0.5s ease-out forwards',
        'fade-in':   'fadeIn 0.3s ease-out forwards',
        'slide-in':  'slideIn 0.4s ease-out forwards',
        'pulse-slow':'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'card':  '0 4px 24px rgba(0,0,0,0.3)',
        'glow':  '0 0 30px rgba(255,122,69,0.25)',
        'blue':  '0 0 30px rgba(15,61,92,0.4)',
      },
    },
  },
  plugins: [],
};
