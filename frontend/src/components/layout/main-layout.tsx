import React from 'react'
import { Footer } from '@/components/layout/footer'
import { cn } from '@/lib/utils'
import { Header, IHeaderProps } from '@/components/layout/header/header'

enum Edges {
	top = 'top'
}

interface IMainLayoutProps {
	children: React.ReactNode
	headerProps?: IHeaderProps
	mainClassName?: string
	edges?: Edges[]
}

const MainLayout = ({ children, headerProps, edges = [Edges.top], mainClassName }: IMainLayoutProps) => {
	return (
		<>
			<Header {...headerProps} />
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
