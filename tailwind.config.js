/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        thai: ['var(--font-noto-thai)', 'Noto Sans Thai', 'Sarabun', 'Leelawadee UI', 'Thonburi', 'sans-serif'],
        hebrew: ['var(--font-rubik)', 'Rubik', 'Arial Hebrew', 'Noto Sans Hebrew', 'David Libre', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#536C4A',
          light: '#B0BF93',
        },
        cannabis: {
          hybrid: '#4f7bff',
          sativa: '#ff6633',
          indica: '#38b24f',
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'shimmer': 'shimmer 3s infinite',
        'glitch': 'glitch 8s infinite',
        'blink': 'blink 1s infinite',
        'chomp': 'chomp 0.6s infinite',
      },
      keyframes: {
        fadeInUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        glitch: {
          '0%, 90%, 100%': { transform: 'translateX(0)' },
          '91%': { transform: 'translateX(-2px)' },
          '92%': { transform: 'translateX(2px)' },
          '93%': { transform: 'translateX(-1px)' },
          '94%': { transform: 'translateX(1px)' },
          '95%': { transform: 'translateX(0)' },
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        chomp: {
          '0%, 100%': { transform: 'translateY(-50%) rotate(0deg)' },
          '50%': { transform: 'translateY(-50%) rotate(45deg)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
