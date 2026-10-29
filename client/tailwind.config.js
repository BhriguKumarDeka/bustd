/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#F5F5F2',
          dark: '#090909'
        },
        nav: {
          light: '#F0F0ED',
          dark: '#0C0C0C'
        },
        card: {
          light: '#FFFFFF',
          dark: '#101010'
        },
        raised: {
          light: '#FAFAF8',
          dark: '#151515'
        },
        interactive: {
          light: '#F1F1ED',
          dark: '#1B1B1B'
        },
        popover: {
          light: '#FFFFFF',
          dark: '#202020'
        },
        charcoal: {
          DEFAULT: '#18181B',
          50: '#F4F4F5',
          100: '#E4E4E7',
          200: '#D4D4D8',
          300: '#A1A1AA',
          400: '#71717A',
          500: '#52525B',
          600: '#3F3F46',
          700: '#27272A',
          800: '#18181B',
          900: '#09090B'
        },
        accent: {
          red: '#DC2626',
          'red-muted': '#B91C1C',
          green: '#16A34A',
          'green-muted': '#15803D',
          amber: '#D97706',
          'amber-muted': '#B45309'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        serif: ['Instrument Serif', 'Georgia', 'Cambria', 'serif']
      },
      borderRadius: {
        'control': '8px',
        'input': '8px',
        'panel': '11px',
        'workspace': '14px'
      },
      boxShadow: {
        'soft-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'soft-md': '0 3px 10px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 10px 25px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.35)',
        'dark-md': '0 4px 12px 0 rgba(0, 0, 0, 0.45)',
        'dark-lg': '0 12px 30px -4px rgba(0, 0, 0, 0.65)'
      }
    },
  },
  plugins: [],
}
