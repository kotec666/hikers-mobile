import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Head from 'next/head'

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
			<Head>
				<meta name="yandex-verification" content="55ad64b0b9685a82" />
			</Head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
		</html>
	)
}
