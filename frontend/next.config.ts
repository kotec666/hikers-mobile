import path from 'path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	poweredByHeader: false,
	compress: true,
	reactStrictMode: true,
	// turbopack: {
	// 	root: path.join(__dirname)
	// },
	outputFileTracingRoot: path.join(__dirname, '../'),
	images: {
		remotePatterns: [new URL('https://hikers.run/api/static/**')]
	},
	env: {
		ya_verification: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION
	},
	// publicRuntimeConfig: {
	// 	NEXT_PUBLIC_YANDEX_VERIFICATION: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION
	// },
	experimental: {
		externalDir: true,
		optimizeCss: true
	}
}

export default nextConfig
