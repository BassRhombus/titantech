import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0a51c2',
          light: '#3b7de6',
          dark: '#083d94',
        },
        secondary: {
          DEFAULT: '#2bc56b',
          light: '#4ed88a',
          dark: '#22a057',
        },
        accent: {
          DEFAULT: '#18a099',
          light: '#1fc2b9',
          dark: '#138580',
        },
        background: {
          DEFAULT: '#1A1A1E',
          paper: '#16181D',
          secondary: '#25262B',
          tertiary: '#2C2E33',
        },
        surface: '#1F2937',
        'text-primary': '#E5E7EB',
        'text-secondary': '#9CA3AF',
        divider: '#374151',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#06B6D4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        chip: '16px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 8px 30px rgba(10, 81, 194, 0.2)',
        'glow-primary': '0 0 20px rgba(10, 81, 194, 0.4)',
        'glow-secondary': '0 0 20px rgba(43, 197, 107, 0.4)',
        'glow-accent': '0 0 20px rgba(24, 160, 153, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
