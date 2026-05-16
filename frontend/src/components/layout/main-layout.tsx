import React, { Suspense } from 'react'
import { Header, HeaderProps } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { cn } from '@/lib/utils'

enum Edges {
	top = 'top'
}

interface IMainLayoutProps {
	children: React.ReactNode
	headerProps?: HeaderProps
	mainClassName?: string
	edges?: Edges[]
}

const MainLayout = ({ children, headerProps, edges = [Edges.top], mainClassName }: IMainLayoutProps) => {
	return (
		<>
			<Suspense fallback={null}>
				<Header {...headerProps} />
			</Suspense>
			<main
				className={cn(
					'',
					{
						'pt-16 lg:pt-20': edges.includes(Edges.top)
					},
					mainClassName
				)}
			>
				{children}
			</main>
			<Footer />
		</>
	)
}

export default MainLayout
