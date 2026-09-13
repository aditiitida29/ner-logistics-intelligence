/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dynamic Multi-Theme Support via CSS Variables
        white: 'rgb(var(--color-text-white) / <alpha-value>)',
        slate: {
          50: 'rgb(var(--color-slate-50) / <alpha-value>)',
          100: 'rgb(var(--color-slate-100) / <alpha-value>)',
          200: 'rgb(var(--color-slate-200) / <alpha-value>)',
          300: 'rgb(var(--color-slate-300) / <alpha-value>)',
          400: 'rgb(var(--color-slate-400) / <alpha-value>)',
          500: 'rgb(var(--color-slate-500) / <alpha-value>)',
          600: 'rgb(var(--color-slate-600) / <alpha-value>)',
          700: 'rgb(var(--color-slate-700) / <alpha-value>)',
          800: 'rgb(var(--color-slate-800) / <alpha-value>)',
          850: 'rgb(var(--color-slate-850) / <alpha-value>)',
          900: 'rgb(var(--color-slate-900) / <alpha-value>)',
          950: 'rgb(var(--color-slate-950) / <alpha-value>)',
        },
        blue: {
          50: 'rgb(var(--color-blue-50) / <alpha-value>)',
          100: 'rgb(var(--color-blue-100) / <alpha-value>)',
          200: 'rgb(var(--color-blue-200) / <alpha-value>)',
          300: 'rgb(var(--color-blue-300) / <alpha-value>)',
          400: 'rgb(var(--color-blue-400) / <alpha-value>)',
          500: 'rgb(var(--color-blue-500) / <alpha-value>)',
          600: 'rgb(var(--color-blue-600) / <alpha-value>)',
          700: 'rgb(var(--color-blue-700) / <alpha-value>)',
          800: 'rgb(var(--color-blue-800) / <alpha-value>)',
          900: 'rgb(var(--color-blue-900) / <alpha-value>)',
          950: 'rgb(var(--color-blue-950) / <alpha-value>)',
        },
        // Functional Green Gradient (Representing Different System Functions)
        green: {
          lightest: '#E6F4EA', // Lightest Mint (High Accessibility >80% & Safe Routes)
          mint: '#A7F3D0',     // Pale Mint Accent (Verified Highway Reports)
          meadow: '#34D399',   // Fresh Meadow (Active Moving Fleet Convoys)
          emerald: '#10B981',  // Emerald Green (Real-Time GPS & Online Telemetry)
          sage: '#84A98C',     // Sage Green (Alternative Mountain Bypass & Waypoints)
          moss: '#52796F',     // Moss Green (District Hub Operational Indicators)
          khaki: '#A3B18A',    // Olive Khaki (Terrain Elevation & Weather Advisories)
          olive: '#6F8052',    // Olive Green (Tactical Analytics & Ridge Passes)
          'olive-dark': '#3A4A28', // Dark Olive (Monitored Highway Corridors)
          forest: '#283618',   // Forest Olive (Protected Supply Lines)
        },
        cream: {
          50: '#FFFFFF',
          100: '#FDFBF7',
          200: '#F8F2EA',
          300: '#ECE0D2',
          400: '#DAC0A9',
          500: '#BE997B',
        },
        brown: {
          50: '#FDFBF7',
          100: '#F8F2EA',
          200: '#ECE0D2',
          300: '#DAC0A9',
          400: '#BE997B',
          500: '#966E52',
          600: '#735039',
          700: '#543928',
          800: '#3B281C',
          900: '#251810',
          950: '#190F09',
        }
      }
    },
  },
  plugins: [],
}
