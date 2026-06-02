/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark shuttle theme
        navy: { DEFAULT: '#0a0f1e', 800: '#0d1428', 900: '#070b15' },
        charcoal: { DEFAULT: '#111827', light: '#1a2035' },
        surface: { DEFAULT: '#1a2035', 2: '#232b42', 3: '#2d3654' },
        neon: { DEFAULT: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
        silver: { DEFAULT: '#94a3b8', light: '#cbd5e1', dark: '#64748b' },
        // Light shuttle theme
        slate: { shuttle: '#f0f4ff' },
        blue: { shuttle: '#1e40af' }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-neon': 'pulseNeon 2s infinite',
        'spin-slow': 'spin 3s linear infinite'
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        pulseNeon: { '0%,100%': { boxShadow: '0 0 0 0 rgba(59,130,246,0)' }, '50%': { boxShadow: '0 0 20px 4px rgba(59,130,246,0.3)' } }
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        neon: '0 0 20px rgba(59,130,246,0.3)',
        'neon-sm': '0 0 10px rgba(59,130,246,0.2)',
        glass: '0 8px 32px rgba(0,0,0,0.3)',
        card: '0 4px 20px rgba(0,0,0,0.2)'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
