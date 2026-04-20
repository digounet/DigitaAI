/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        fun: ['"Fredoka"', '"Baloo 2"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        sky1: '#7fd4ff',
        sky2: '#bde7ff',
        sun: '#ffd84d',
        grass: '#7ed957',
        candy: '#ff6fa5',
        grape: '#a78bfa',
        tangerine: '#ff8c42',
        mint: '#5eead4',
        coral: '#ff7a7a',
      },
      boxShadow: {
        bubbly: '0 10px 0 rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.12)',
        pop: '0 6px 0 rgba(0,0,0,0.12)',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        pop: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-6px)' },
          '75%': { transform: 'translateX(6px)' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        wiggle: 'wiggle 1.5s ease-in-out infinite',
        pop: 'pop 300ms ease-out forwards',
        shake: 'shake 300ms',
      },
    },
  },
  plugins: [],
};
