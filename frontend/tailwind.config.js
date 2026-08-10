/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      borderColor: {
        DEFAULT: '#212225',
      },
      colors: {
        // Linear-style dark palette: near-black canvas, barely-there borders,
        // one indigo accent, muted secondary text.
        canvas: '#08090A',
        surface: {
          DEFAULT: '#0F1011',
          raised: '#151617',
          hover: '#1B1C1E',
        },
        line: {
          DEFAULT: '#212225',
          strong: '#2C2D31',
        },
        content: {
          DEFAULT: '#F7F8F8',
          muted: '#8A8F98',
          faint: '#62666D',
        },
        accent: {
          DEFAULT: '#5E6AD2',
          hover: '#6E79E0',
        },
        positive: '#4CB782',
        negative: '#EB5757',
        caution: '#F2C94C',
      },
      borderRadius: {
        lg: '8px',
        xl: '10px',
        '2xl': '12px',
        '3xl': '14px',
      },
      letterSpacing: {
        tight: '-0.012em',
      },
    },
  },
  plugins: [],
}
