import React from 'react'
import { Header, HeaderProps } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

interface IMainLayoutProps {
	children: React.ReactNode
	headerProps?: HeaderProps
	mainClassName?: string
}

const MainLayout = ({ children, headerProps, mainClassName }: IMainLayoutProps) => {
	return (
		<>
			<Header {...headerProps} />
			<main className={mainClassName}>{children}</main>
			<Footer />
		</>
	)
}

export default MainLayout
