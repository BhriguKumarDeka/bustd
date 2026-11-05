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
        // Core Palette Swatches:
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
          50: '#F7F5EC',
          100: '#EFECE0',
          200: '#E0DDBD',
          300: '#C7C3A8',
          400: '#918D77',
          500: '#615E50',
          600: '#4D4A3E',
          700: '#3A382F',
          800: '#2A2922',
          900: '#1F1E19',
          950: '#141410',
        },
        canvas: {
          light: '#F7F5EC',
          dark: '#161512'
        },
        nav: {
          light: '#EEEADF',
          dark: '#1C1B17'
        },
        card: {
          light: '#FFFFFF',
          dark: '#1F1E1A'
        },
        raised: {
          light: '#FAF8F2',
          dark: '#26241E'
        },
        interactive: {
          light: '#E6E1D2',
          dark: '#3A382F'
        },
        popover: {
          light: '#FFFFFF',
          dark: '#2E2C24'
        },
        accent: {
          red: '#DC2626',
          'red-muted': '#B91C1C',
          green: '#16A34A',
          'green-muted': '#15803D',
          amber: '#D97706',
          'amber-muted': '#B45309',
          // New vibrant gradient anchors (replacing lime)
          sky: '#38BDF8',
          violet: '#818CF8',
          magenta: '#EC4899',
          orange: '#F97316'
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'control': '10px',
        'input': '12px',
        'panel': '14px',
        'workspace': '18px',
        'card-lg': '22px'
      },
      boxShadow: {
        'soft-sm': '0 1px 3px 0 rgba(58, 56, 47, 0.04)',
        'soft-md': '0 4px 14px 0 rgba(58, 56, 47, 0.06), 0 1px 3px 0 rgba(58, 56, 47, 0.03)',
        'soft-lg': '0 12px 30px -4px rgba(58, 56, 47, 0.09), 0 4px 8px -2px rgba(58, 56, 47, 0.03)',
        'dark-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
        'dark-md': '0 6px 18px 0 rgba(0, 0, 0, 0.55)',
        'dark-lg': '0 16px 36px -6px rgba(0, 0, 0, 0.75)',
        'glow-bustd': '0 0 20px -2px rgba(236, 72, 153, 0.4), 0 0 8px -1px rgba(56, 189, 248, 0.3)',
      }
    },
  },
  plugins: [],
}
