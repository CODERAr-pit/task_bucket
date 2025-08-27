/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        'bg-primary': '#00043C',      // Deep navy background
        'bg-card': '#02011a',         // Card background
        'bg-card-hover': '#000326',   // Card hover background
        
        // Border and divider
        'border-primary': '#1E1E2E',
        
        // Text colors
        'text-heading': '#FFFFFF',
        'text-body': '#C9C9C9',
        'text-muted': '#8B8B8B',
        
        // Status colors
   'status-pending': '#E9E4D8',   // Soft Beige → neutral, doesn’t clash
'status-accepted': '#20A856',  // Fresh Green → readable, signals positivity
'status-declined': '#C0392B',  // Strong Red → distinct from badge red
        
        // Badge colors
      'badge-academic': '#2E5A9F',       // Deep Blue → slightly darker than #346CB0, more professional
'badge-corporate': '#178F51',      // Dark Teal Green → deeper than #1CA25E, less bright
'badge-public': '#5A3F9F',         // Rich Purple → darker than #6C4AB6, elegant
'badge-entrepreneurial': '#8C4F11',// Burnt Orange → earthy, strong but not too bright
'badge-service': '#6A1414',        // Dark Crimson → darker than #7A1717, grounded

      },
      borderRadius: {
        '2xl': '16px',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
