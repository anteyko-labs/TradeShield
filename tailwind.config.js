/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#0A0A0A',
        'dark-gray': '#1A1A1A',
        'medium-gray': '#2A2A2A',
        'blue-primary': '#0066FF',
        'blue-light': '#3388FF',
        'blue-dark': '#0044CC',
        'green-profit': '#00FF88',
        'red-loss': '#FF4444',
        'orange-warning': '#FF8800',
        'cyan-info': '#00CCFF',
        'text-primary': '#FFFFFF',
        'text-secondary': '#CCCCCC',
        'text-muted': '#888888',
        'text-disabled': '#555555',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
        'xl': '24px',
        '2xl': '36px',
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 8px 30px rgba(0, 102, 255, 0.3)',
        'blue-glow': '0 0 20px rgba(0, 102, 255, 0.5)',
        'green-glow': '0 0 20px rgba(0, 255, 136, 0.5)',
      },
    },
  },
  plugins: [],
};
