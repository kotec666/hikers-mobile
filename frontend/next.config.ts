import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
	poweredByHeader: false,
	compress: true,
	reactStrictMode: true,
	turbopack: {
		root: path.join(__dirname)
	},
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
		optimizeCss: true
		// optimizePackageImports: [
		//   "@mui/material",
		//   "@emotion/react",
		//   "@emotion/styled",
		// ],
	}
}

export default nextConfig
