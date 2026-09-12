/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Layout: Elegant Brown & Cream White Theme
        slate: {
          50: '#FDFBF7',   // Pure Cream White
          100: '#F8F2EA',  // Brilliant Cream White
          200: '#ECE0D2',  // Soft Ivory Cream
          300: '#DAC0A9',  // Warm Light Cream
          400: '#BE997B',  // Warm Almond / Sand Text
          500: '#966E52',  // Cinnamon / Cocoa
          600: '#735039',  // Warm Earth Nutmeg
          700: '#543928',  // Earthy Cocoa Divider
          800: '#3B281C',  // Warm Walnut / Dark Coffee Border
          850: '#2E1E14',  // Roasted Bean Surface
          900: '#251810',  // Dark Chocolate Mocha Surface
          950: '#190F09',  // Deepest Roasted Espresso Background
        },
        // Primary Interactive Accents (Warm Saddle Brown & Cognac)
        blue: {
          50: '#FAF3EC',
          100: '#F6E4D5',
          200: '#ECC2A1',
          300: '#E09E6E',
          400: '#C67845',  // Amber Bronze Accent
          500: '#A85A2D',  // Warm Caramel Brown
          600: '#8E4A23',  // Rich Saddle Brown / Cognac (Primary CTA)
          700: '#6F3B1D',  // Dark Saddle Leather
          800: '#4C2915',  // Deep Mahogany
          900: '#311A0D',  // Roasted Cocoa Tint
          950: '#22120A',  // Deep Espresso Tint
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
