/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'background': '#1A1A1A', // Very dark, desaturated charcoal/blue-grey
                'surface': '#262626',    // Slightly lighter surface for cards, with a subtle depth
                'primary': {
                    'DEFAULT': '#FF6B00', // The vibrant orange/red from your logo
                    'hover': '#E05F00',   // A slightly darker shade for hover
                },
                'text': {
                    'primary': '#E0E0E0',     // Soft off-white for primary text
                    'secondary': '#A0A0A0',   // Muted grey for secondary text
                },
                'border': '#3D3D3D',          // Subtle, darker grey borders
            },

            // --- Typography (same) ---
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },

            // --- Adjusted Shadows for Dark Mode ---
            boxShadow: {
                'soft-lg': '0 10px 30px rgba(0, 0, 0, 0.3)',
                'soft-xl': '0 20px 45px rgba(0, 0, 0, 0.4)',
                // Subtle glow using the new primary color
                'glow-primary': '0 0 15px rgba(255, 107, 0, 0.25)',
            },

            // --- Other theme extensions from previous config can remain ---
            borderRadius: {
                'lg': '0.75rem',
                'xl': '1rem',
                '2xl': '1.5rem',
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.7s ease-out forwards',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(15px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [
        require('tailwind-scrollbar-hide'),
    ],
}