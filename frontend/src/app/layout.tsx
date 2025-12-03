import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { env } from '@/consts/env'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin']
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin']
})

export const metadata: Metadata = {
	title: 'Hikers'
}

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	// preconnect(env.api || "")
	// prefetchDNS(env.api || "")
	return (
		<html lang="ru">
			<head>
				<meta name="yandex-verification" content={env.ya_verification} />
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
		</html>
	)
}
