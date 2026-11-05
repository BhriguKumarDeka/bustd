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
        // Modern cool neutral palette (Slate / Obsidian / Blue-Pink)
        canvas: {
          light: '#F8FAFC', // Cool slate-50
          dark: '#090B0E'   // Deep obsidian black
        },
        nav: {
          light: '#FFFFFF',
          dark: '#0E1015'   // Obsidian rail
        },
        card: {
          light: '#FFFFFF',
          dark: '#14171F'   // Refined slate surface
        },
        raised: {
          light: '#F1F5F9',
          dark: '#1B1E28'
        },
        interactive: {
          light: '#E2E8F0',
          dark: '#242936'
        },
        popover: {
          light: '#FFFFFF',
          dark: '#181B24'
        },
        // Modern cool text slate tokens
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
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
        'soft-sm': '0 1px 3px 0 rgba(15, 23, 42, 0.05)',
        'soft-md': '0 4px 14px 0 rgba(15, 23, 42, 0.07), 0 1px 3px 0 rgba(15, 23, 42, 0.03)',
        'soft-lg': '0 12px 30px -4px rgba(15, 23, 42, 0.1), 0 4px 8px -2px rgba(15, 23, 42, 0.04)',
        'dark-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
        'dark-md': '0 6px 18px 0 rgba(0, 0, 0, 0.65)',
        'dark-lg': '0 16px 36px -6px rgba(0, 0, 0, 0.85)',
        'glow-bustd': '0 0 20px -2px rgba(236, 72, 153, 0.45), 0 0 8px -1px rgba(56, 189, 248, 0.35)',
      }
    },
  },
  plugins: [],
}
