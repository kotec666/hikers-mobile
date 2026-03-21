/** @type {import('tailwindcss').Config} */
const { Colors } = require('./constants/Colors')
module.exports = {
	content: ['./app/**/*.{js,ts,tsx}', './App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			colors: Colors
		}
	},
	plugins: []
}
