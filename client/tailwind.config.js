/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // --- Modern Foundation (Warm Grays & Rich Whites) ---
                'canvas': '#fafaf9',           // Warm white canvas
                'surface': '#ffffff',          // Pure white for elevated surfaces
                'surface-soft': '#f8f8f7',     // Subtle warm off-white
                'surface-hover': '#f3f3f2',    // Gentle hover state

                // --- Sophisticated Neutrals (Modern Grays) ---
                'neutral-50': '#fafaf9',       // Lightest warm neutral
                'neutral-100': '#f5f5f4',      // Very light warm gray
                'neutral-200': '#e7e5e4',      // Light borders and dividers
                'neutral-300': '#d6d3d1',      // Medium-light inactive elements
                'neutral-400': '#a8a29e',      // Muted text and icons
                'neutral-500': '#78716c',      // Body text
                'neutral-600': '#57534e',      // Headings
                'neutral-700': '#44403c',      // High emphasis text
                'neutral-800': '#292524',      // Maximum contrast
                'neutral-900': '#1c1917',      // Ultra dark

                // --- Modern Rich Accent Colors ---
                'indigo': {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',             // Modern indigo
                    400: '#818cf8',
                    500: '#6366f1',             // Primary indigo
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                },

                'emerald': {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',             // Modern emerald
                    400: '#34d399',
                    500: '#10b981',             // Primary emerald
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                },

                'amber': {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',             // Modern amber
                    400: '#fbbf24',
                    500: '#f59e0b',             // Primary amber
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                },

                'rose': {
                    50: '#fff1f2',
                    100: '#ffe4e6',
                    200: '#fecdd3',
                    300: '#fda4af',             // Modern rose
                    400: '#fb7185',
                    500: '#f43f5e',             // Primary rose
                    600: '#e11d48',
                    700: '#be123c',
                    800: '#9f1239',
                    900: '#881337',
                },

                // --- Status Colors (Modern & Professional) ---
                'status': {
                    'success': '#059669',       // Rich emerald green
                    'success-bg': '#ecfdf5',    // Light emerald background
                    'progress': '#4f46e5',      // Rich indigo blue
                    'progress-bg': '#eef2ff',   // Light indigo background
                    'warning': '#d97706',       // Rich amber orange
                    'warning-bg': '#fffbeb',    // Light amber background
                    'error': '#e11d48',         // Rich rose red
                    'error-bg': '#fff1f2',      // Light rose background
                    'accepted': '#10b981',      // Emerald for accepted states
                    'declined': '#e11d48',      // Rose for declined states
                },

                // --- Domain Colors (Sophisticated & Modern) ---
                'domain': {
                    'web': '#4f46e5',           // Rich indigo
                    'web-bg': '#eef2ff',
                    'design': '#d97706',        // Rich amber
                    'design-bg': '#fffbeb',
                    'video': '#059669',         // Rich emerald
                    'video-bg': '#ecfdf5',
                    'content': '#e11d48',       // Rich rose
                    'content-bg': '#fff1f2',
                },

                // --- Legacy Color System (for backward compatibility) ---
                'bg': {
                    'primary': '#fafaf9',       // Maps to canvas
                    'secondary': '#f5f5f4',     // Maps to neutral-100
                    'card': '#ffffff',          // Maps to surface
                },

                'text': {
                    'heading': '#292524',       // Maps to neutral-800
                    'body': '#44403c',          // Maps to neutral-700
                    'muted': '#78716c',         // Maps to neutral-500
                },

                'border': {
                    'primary': '#e7e5e4',       // Maps to neutral-200
                },

                // --- Modern Accent Colors (2025 Trends) ---
                'mocha': {
                    50: '#faf7f5',
                    100: '#f4ede8',
                    200: '#e8d5cc',             // Pantone 2025 inspired
                    300: '#d4a574',             // Mocha mousse
                    400: '#b8956f',
                    500: '#9c7c5a',
                    600: '#7d6247',
                },

                'charcoal': {
                    50: '#f6f6f6',
                    100: '#e7e7e7',
                    200: '#d1d1d1',
                    300: '#b0b0b0',             // Modern charcoal
                    400: '#888888',
                    500: '#6d6d6d',             // Primary charcoal
                    600: '#5d5d5d',
                    700: '#4f4f4f',
                    800: '#454545',
                    900: '#3d3d3d',
                },

                'slate': {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',             // Modern slate
                    400: '#94a3b8',
                    500: '#64748b',             // Primary slate
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                },
            },

            // --- Premium Typography Scale ---
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
                'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
                'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
                'lg': ['1.125rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
                'xl': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.02em' }],
                '2xl': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.03em' }],
                '3xl': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.04em' }],
                '4xl': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.05em' }],
            },

            fontWeight: {
                'light': '300',
                'normal': '400',
                'medium': '500',
                'semibold': '600',
                'bold': '700',
            },

            // --- Sophisticated Spacing ---
            spacing: {
                '18': '4.5rem',   // 72px
                '22': '5.5rem',   // 88px
                '26': '6.5rem',   // 104px
                '30': '7.5rem',   // 120px
            },

            // --- Modern Border Radius ---
            borderRadius: {
                'sm': '6px',      // Subtle rounding
                'md': '8px',      // Standard component rounding
                'lg': '12px',     // Cards and modals
                'xl': '16px',     // Large containers
                '2xl': '20px',    // Hero sections
                '3xl': '24px',    // Maximum rounding
            },

            // --- Professional Shadow System ---
            boxShadow: {
                'xs': '0 1px 2px rgba(0, 0, 0, 0.05)',
                'sm': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                'md': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
                'lg': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
                'xl': '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',

                // Modern colored shadows
                'indigo': '0 4px 14px rgba(79, 70, 229, 0.2)',
                'emerald': '0 4px 14px rgba(5, 150, 105, 0.2)',
                'amber': '0 4px 14px rgba(217, 119, 6, 0.2)',
                'rose': '0 4px 14px rgba(225, 29, 72, 0.2)',
                'charcoal': '0 4px 14px rgba(109, 109, 109, 0.15)',
            },

            // --- Premium Animations ---
            transitionDuration: {
                '250': '250ms',
                '350': '350ms',
                '400': '400ms',
            },

            transitionTimingFunction: {
                'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
                'bounce-gentle': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            },

            // --- Advanced Typography ---
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Cascadia Code', 'monospace'],
            },

            // --- Component-Specific Utilities ---
            backdropBlur: {
                'xs': '2px',
                'sm': '4px',
            },
        },
    },
    plugins: [
        require('tailwind-scrollbar-hide'),

        // Modern component classes
        function({ addComponents }) {
            addComponents({
                '.card': {
                    '@apply bg-surface rounded-lg shadow-sm border border-neutral-200 p-6': {},
                },
                '.card-hover': {
                    '@apply transition-all duration-250 hover:shadow-md hover:-translate-y-0.5': {},
                },
                '.btn-primary': {
                    '@apply bg-indigo-500 text-white font-medium px-4 py-2 rounded-md transition-all duration-250 hover:bg-indigo-600 hover:shadow-indigo': {},
                },
                '.btn-secondary': {
                    '@apply bg-surface border border-neutral-200 text-neutral-600 font-medium px-4 py-2 rounded-md transition-all duration-250 hover:bg-surface-hover hover:shadow-sm': {},
                },
                '.input-field': {
                    '@apply w-full px-3 py-2 border border-neutral-200 rounded-md bg-surface focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-250': {},
                },
            })
        }
    ],
}
