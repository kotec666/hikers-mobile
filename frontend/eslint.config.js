import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

import eslintNextPlugin from '@next/eslint-plugin-next'
import globals from 'globals'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
})

export default defineConfig([
	...nextVitals,
	...nextTs,
	prettier,
	{
		languageOptions: {
			sourceType: 'module',
			globals: {
				...globals.node,
				...Object.fromEntries(Object.entries(globals.jest).map(([key]) => [key, 'off']))
			}
		},

		plugins: {
			next: eslintNextPlugin
		},
		extends: [...compat.extends('plugin:prettier/recommended')],
		rules: {
			'@typescript-eslint/interface-name-prefix': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-namespace': 'off',
			'no-var': 'off',
			'max-len': 'off'
		}
	},
	globalIgnores([
		'.next/**',
		'out/**',
		'build/**',
		'next-env.d.ts',
		'node_modules/*',
		'**/*.spec.ts',
		'**/tsconfig.json',
		'src/shared/*'
	])
])
