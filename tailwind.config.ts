import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Discipline Theme (Default) - Dark, intense, performance-focused
        discipline: {
          bg: '#0A0E1A',
          card: '#141B2D',
          primary: '#3B82F6', // Blue - Discipline
          secondary: '#10B981', // Green - Performance
          accent: '#F59E0B', // Amber - Struggle/Effort
          danger: '#EF4444', // Red - Failure/Missed
          text: '#F8FAFC',
          muted: '#94A3B8',
          border: '#1E293B',
          success: '#10B981',
          warning: '#F59E0B',
          gradient: {
            from: '#1E3A8A',
            to: '#3B82F6',
          },
        },
        // Struggle Theme - Red/Orange intensity
        struggle: {
          bg: '#1A0A0A',
          card: '#2D1414',
          primary: '#EF4444',
          secondary: '#F59E0B',
          accent: '#F97316',
          danger: '#DC2626',
          text: '#F8FAFC',
          muted: '#94A3B8',
          border: '#3F1F1F',
          success: '#10B981',
          warning: '#F59E0B',
          gradient: {
            from: '#7F1D1D',
            to: '#EF4444',
          },
        },
        // Performance Theme - Green/Blue success
        performance: {
          bg: '#0A1A0F',
          card: '#142D1B',
          primary: '#10B981',
          secondary: '#3B82F6',
          accent: '#06B6D4',
          danger: '#EF4444',
          text: '#F8FAFC',
          muted: '#94A3B8',
          border: '#1F3F2A',
          success: '#10B981',
          warning: '#F59E0B',
          gradient: {
            from: '#065F46',
            to: '#10B981',
          },
        },
        // Warrior Theme - Dark purple/red intensity
        warrior: {
          bg: '#0F0A1A',
          card: '#1A142D',
          primary: '#8B5CF6',
          secondary: '#EC4899',
          accent: '#F59E0B',
          danger: '#EF4444',
          text: '#F8FAFC',
          muted: '#94A3B8',
          border: '#2F1F3F',
          success: '#10B981',
          warning: '#F59E0B',
          gradient: {
            from: '#581C87',
            to: '#8B5CF6',
          },
        },
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        accent: ['Playfair Display', 'serif'],
      },
      borderRadius: {
        card: '16px',
        cell: '10px',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.05)',
        'soft-lg': '0 20px 40px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
export default config

