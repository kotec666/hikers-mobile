import type { Metadata } from 'next'
import { Geist, Geist_Mono, Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-sans' })

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin', 'cyrillic']
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin', 'cyrillic']
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
		<html lang="ru" data-scroll-behavior="smooth" className={cn('font-sans', inter.variable)}>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
		</html>
	)
}
