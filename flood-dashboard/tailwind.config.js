/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
        text: ['SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
        compact: ['SF Compact', 'system-ui', 'Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'risk-moderate': '#ffae00',
        'risk-high': '#d53c4b',
        'risk-high-bg': '#fef2f2',
        'risk-medium': '#f54900',
        'risk-medium-bg': '#fff7ed',
        'risk-orange-border': '#ff6900',
        'risk-low': '#519bd3',
        'risk-low-bg': '#eff6ff',
        'success-green': '#00a63e',
        'live-dot': '#4aaf59',
        'link-blue': '#51a2ff',
        'stat-blue': '#519bd3',
        'alert-red': '#fb2c36',
        'budget-dark': '#155dfc',
        'budget-light': '#51a2ff',
      },
      borderRadius: {
        sm: '10px',
        md: '14px',
        lg: '16px',
        pill: '46px',
      },
    },
  },
  plugins: [],
};
