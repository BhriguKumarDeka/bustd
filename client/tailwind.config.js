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
        // Pure modern neutral gray/blackish tokens (zero blue, zero olive)
        canvas: {
          light: '#F7F7F8', // Pure soft neutral gray
          dark: '#0E0F11'   // Deep pure charcoal/black
        },
        nav: {
          light: '#FFFFFF',
          dark: '#111214'   // Pure neutral rail
        },
        card: {
          light: '#FFFFFF',
          dark: '#141517'   // Refined neutral dark surface
        },
        raised: {
          light: '#F4F4F6',
          dark: '#1C1D20'
        },
        interactive: {
          light: '#E5E5E8',
          dark: '#24252A'
        },
        popover: {
          light: '#FFFFFF',
          dark: '#161719'
        },
        // Mapped to pure neutral zinc/charcoal (zero blue undertones)
        slate: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          850: '#1E1E22',
          900: '#151618',
          950: '#0A0A0C',
        },
        accent: {
          red: '#EF4444',
          'red-muted': '#DC2626',
          green: '#10B981',
          'green-muted': '#059669',
          amber: '#F59E0B',
          'amber-muted': '#D97706',
          // Vibrant multi-hue gradient anchors
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
        'soft-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        'soft-md': '0 4px 14px 0 rgba(0, 0, 0, 0.06), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
        'soft-lg': '0 12px 30px -4px rgba(0, 0, 0, 0.09), 0 4px 8px -2px rgba(0, 0, 0, 0.03)',
        'dark-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
        'dark-md': '0 6px 18px 0 rgba(0, 0, 0, 0.65)',
        'dark-lg': '0 16px 36px -6px rgba(0, 0, 0, 0.85)',
        'glow-bustd': '0 0 20px -2px rgba(236, 72, 153, 0.45), 0 0 8px -1px rgba(56, 189, 248, 0.35)',
      }
    },
  },
  plugins: [],
}
