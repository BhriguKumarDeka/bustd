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
        // Theme Dualing Semantic Tokens (Zero slate, pure neutral dual-theme system)
        canvas: 'var(--color-canvas)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          raised: 'var(--color-surface-raised)',
          subtle: 'var(--color-surface-subtle)',
          interactive: 'var(--color-surface-interactive)',
          overlay: 'var(--color-surface-overlay)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          muted: 'var(--color-border-muted)',
          strong: 'var(--color-border-strong)',
        },
        // Pure neutral palette (zero slate, zero blue)
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          850: '#1C1C1E',
          900: '#151517',
          925: '#101012',
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
      textColor: {
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        muted: 'var(--color-text-muted)',
        inverse: 'var(--color-text-inverse)',
      },
      borderColor: {
        subtle: 'var(--color-border-subtle)',
        muted: 'var(--color-border-muted)',
        strong: 'var(--color-border-strong)',
      },
      backgroundColor: {
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        'surface-raised': 'var(--color-surface-raised)',
        'surface-subtle': 'var(--color-surface-subtle)',
        'surface-interactive': 'var(--color-surface-interactive)',
        'surface-overlay': 'var(--color-surface-overlay)',
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
