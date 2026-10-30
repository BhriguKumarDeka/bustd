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
        // Core Palette Swatches from user specification:
        // #3A382F (Deep warm olive-charcoal)
        // #615E50 (Muted warm olive/sage)
        // #E0DDBD (Warm alabaster cream)
        // #F7F5EC (Warm pearl/cream canvas)
        palette: {
          dark: '#3A382F',
          olive: '#615E50',
          cream: '#E0DDBD',
          sand: '#F7F5EC',
        },
        olive: {
          50: '#F7F5EC',   // Canvas light
          100: '#EFECE0',
          200: '#E0DDBD',  // Alabaster cream
          300: '#C7C3A8',
          400: '#918D77',
          500: '#615E50',  // Muted olive
          600: '#4D4A3E',
          700: '#3A382F',  // Deep warm dark
          800: '#2A2922',
          900: '#1F1E19',
          950: '#141410',
        },
        canvas: {
          light: '#F7F5EC', // exact swatch 4
          dark: '#161512'   // deep warm tonal base
        },
        nav: {
          light: '#EEEADF',
          dark: '#1C1B17'   // tactile sidebar tone
        },
        card: {
          light: '#FFFFFF',
          dark: '#24231E'   // refined surface
        },
        raised: {
          light: '#FAF8F2',
          dark: '#2D2B24'
        },
        interactive: {
          light: '#E6E1D2',
          dark: '#3A382F'   // exact swatch 1
        },
        popover: {
          light: '#FFFFFF',
          dark: '#333129'
        },
        accent: {
          red: '#DC2626',
          'red-muted': '#B91C1C',
          green: '#16A34A',
          'green-muted': '#15803D',
          amber: '#D97706',
          'amber-muted': '#B45309',
          // SmartShort glowing green tab indicator
          lime: '#84CC16',
          'lime-glow': '#A3E635'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        serif: ['Instrument Serif', 'Georgia', 'Cambria', 'serif']
      },
      borderRadius: {
        'control': '10px',
        'input': '10px',
        'panel': '14px',
        'workspace': '18px',
        'card-lg': '20px'
      },
      boxShadow: {
        'soft-sm': '0 1px 3px 0 rgba(58, 56, 47, 0.05)',
        'soft-md': '0 4px 14px 0 rgba(58, 56, 47, 0.08), 0 1px 3px 0 rgba(58, 56, 47, 0.04)',
        'soft-lg': '0 12px 30px -4px rgba(58, 56, 47, 0.12), 0 4px 8px -2px rgba(58, 56, 47, 0.04)',
        'dark-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
        'dark-md': '0 6px 18px 0 rgba(0, 0, 0, 0.55)',
        'dark-lg': '0 16px 36px -6px rgba(0, 0, 0, 0.75)',
        'glow-lime': '0 0 16px -2px rgba(132, 204, 22, 0.55)',
        'glow-cream': '0 0 16px -2px rgba(224, 221, 189, 0.35)'
      }
    },
  },
  plugins: [],
}
