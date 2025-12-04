import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	poweredByHeader: false,
	compress: true,
	reactStrictMode: true,
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
