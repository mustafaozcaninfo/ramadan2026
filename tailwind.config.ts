import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#10b981',
          gold: '#fbbf24',
          dark: '#0f172a',
          darker: '#020617',
        },
        qatar: {
          maroon: '#8B1538',
          maroonLight: '#A01D42',
          maroonDark: '#6B0F2A',
          white: '#FFFFFF',
        },
      },
      boxShadow: {
        'qatar-glow': '0 0 20px rgba(139, 21, 56, 0.3)',
        'brand-glow': '0 0 20px rgba(16, 185, 129, 0.3)',
        'gold-glow': '0 0 20px rgba(251, 191, 36, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
