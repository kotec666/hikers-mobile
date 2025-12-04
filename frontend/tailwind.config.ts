/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	prefix: '',
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif']
			},
			fontSize: {
				base: '16px'
			},
			colors: {
				'dark-bg': '#0D0D0D',
				'dark-black': '#18181B',
				light: '#FAFAFA',
				'light-text': '#FEF2F2',
				'dark-text': '#D4D4D8',
				'placeholder-text': '#71717A',
				'semi-light': '#E4E4E7',
				'yellow-main': '#FACC15',
				'dark-button': '#27272A',
				'input-bg': '#18181B',
				'input-bg-red-error': '#370606',
				'border-button': '#3F3F46',
				'border-main': '#27272A',
				'border-red-error': '#7F1D1D',
				'red-error': '#EF4444'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: []
}
