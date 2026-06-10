/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-light': 'var(--color-primary-light)',
        'primary-pale': 'var(--color-primary-pale)',
        accent: 'var(--color-accent)',
        'accent-pale': 'var(--color-accent-pale)',
        bg: 'var(--color-bg)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        heading: ['DM Serif Display', 'serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in-left': 'fadeInLeft 0.6s ease-out forwards',
        'fade-in-right': 'fadeInRight 0.6s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'blob': 'blob 7s infinite',
        'blob-2': 'blob2 9s infinite',
        'spin-slow': 'spin 8s linear infinite',
        'spin-slower': 'spin 12s linear infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'drift': 'drift 20s linear infinite',
        'drift-reverse': 'drift 25s linear infinite reverse',
        'tilt-glow': 'tiltGlow 3s ease-in-out infinite',
        'dna-float': 'dnaFloat 7s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        blob2: {
          '0%': { transform: 'translate(0px, 0px) scale(1) rotate(0deg)' },
          '25%': { transform: 'translate(-40px, 30px) scale(1.15) rotate(5deg)' },
          '50%': { transform: 'translate(20px, -60px) scale(0.95) rotate(-3deg)' },
          '75%': { transform: 'translate(-30px, -20px) scale(1.05) rotate(4deg)' },
          '100%': { transform: 'translate(0px, 0px) scale(1) rotate(0deg)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        drift: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' },
        },
        tiltGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(15,110,86,0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(15,110,86,0.3)' },
        },
        dnaFloat: {
          '0%, 100%': { transform: 'translateY(0) rotateY(0deg)' },
          '25%': { transform: 'translateY(-15px) rotateY(10deg)' },
          '50%': { transform: 'translateY(-5px) rotateY(-5deg)' },
          '75%': { transform: 'translateY(-20px) rotateY(8deg)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      }
    },
  },
  plugins: [],
}
