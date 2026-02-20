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
        ramadan: {
          green: '#10b981', // Emerald green - İslam rengi
          gold: '#fbbf24', // Amber gold - Lüks ve manevi
          dark: '#0f172a', // Slate 950
          darker: '#020617', // Slate 950 darker
        },
        qatar: {
          maroon: '#8B1538', // Qatar bayrağı maroon/burgundy
          maroonLight: '#A01D42', // Açık maroon
          maroonDark: '#6B0F2A', // Koyu maroon
          white: '#FFFFFF', // Qatar bayrağı beyaz
        },
      },
      boxShadow: {
        'qatar-glow': '0 0 20px rgba(139, 21, 56, 0.3)',
        'ramadan-glow': '0 0 20px rgba(16, 185, 129, 0.3)',
        'gold-glow': '0 0 20px rgba(251, 191, 36, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
