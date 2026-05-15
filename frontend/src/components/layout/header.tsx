'use client'
import Link from 'next/link'
import Image from 'next/image'
import icon from '@/assets/images/icon-40x40.png'
import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion'
import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import Container from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { ResponsiveDialog, ResponsiveDialogContent, ResponsiveDialogTrigger } from '@/components/ui/responsive-dialog'
import DownloadModalContent from '@/components/main-page/download-modal-content'
import { MobileMenuContent } from '@/components/layout/mobile-menu'
import useAppendSearchParam from '@/hooks/useAppendSearchParam'
import { cn } from '@/lib/utils'
import { IContentBlock, SectionId } from '@/app/page'

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const scrollDistance = 1400

function useBoundedScroll(bounds: number) {
	const { scrollY } = useScroll()
	const scrollYBounded = useMotionValue(0)

	useMotionValueEvent(scrollY, 'change', (value) => {
		const previousScrollY = scrollY.getPrevious() || 0
		const scrollYDiff = value - previousScrollY
		scrollYBounded.set(clamp(scrollYBounded.get() + scrollYDiff, 0, bounds))
	})

	const scrollYBoundedProgress = useTransform(scrollYBounded, [0, bounds], [0, 1])

	return { scrollYBoundedProgress }
}

export interface HeaderProps {
	isAnimationLineDisabled?: boolean
	contentBlocks?: IContentBlock[]
}

export function Header({ contentBlocks, isAnimationLineDisabled = true }: HeaderProps) {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const [appendSearchParam] = useAppendSearchParam()
	const action = searchParams.get('action')

	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(action === 'download')

	const { scrollYBoundedProgress } = useBoundedScroll(scrollDistance)
	const scrollYThrottledProgress = useTransform(scrollYBoundedProgress, [0, 0.25, 1], [0, 0, 1])
	const { scrollYProgress } = useScroll()
	const scaleX = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001
	})

	const scrollToContentBlock = (sectionId: SectionId) => {
		const isMobile = window.innerWidth <= 1023
		const prefix = isMobile ? 'mobile' : 'desktop'
		const container = document.getElementById(`${prefix}-${sectionId}`)
		if (!container) return

		container.scrollIntoView({
			behavior: 'smooth',
			block: isMobile ? 'start' : 'center'
		})
	}

	const pushSectionParam = (sectionId: SectionId) => {
		appendSearchParam('section', sectionId)
		scrollToContentBlock(sectionId)
	}

	useEffect(() => {
		const sectionId = searchParams.get('section')
		if (sectionId) scrollToContentBlock(sectionId as SectionId)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleLogoClick = () => {
		if (pathname === '/') {
			window.scrollTo({
				top: 0,
				behavior: 'smooth'
			})
			return
		}
	}

	const handleOpenDownloadModal = useCallback(() => {
		setIsDownloadModalOpen(true)
		appendSearchParam('action', 'download')
	}, [appendSearchParam])

	const handleCloseDownloadModal = () => {
		setIsDownloadModalOpen(false)
		appendSearchParam('action', '')
	}

	const handleMobileMenuClick = (sectionId: SectionId) => {
		setIsMobileMenuOpen(false)
		return pushSectionParam(sectionId)
	}

	const handlePressDownloadInMobileMenu = () => {
		setIsMobileMenuOpen(false)
		handleOpenDownloadModal()
	}

	return (
		<header className="sticky top-0 z-50 backdrop-blur-md border-b border-[#1a1a1a] bg-black-0d/60">
			<Container>
				<div className="flex items-center justify-between h-16 lg:h-20">
					<div className="flex items-center gap-3">
						<div className="min-w-10 w-10 min-h-10 h-10">
							<Link href="/" onNavigate={handleLogoClick}>
								<Image
									src={icon}
									alt="На главную страницу"
									className="w-full h-full object-cover"
									draggable="false"
									priority
								/>
							</Link>
						</div>
						<div>
							<h1 className="text-white font-semibold text-lg">Hikers</h1>
							<p className="text-gray-400 text-xs">Поделись своими достижениями</p>
						</div>
					</div>

					<nav className="hidden md:flex items-center gap-8">
						{contentBlocks?.map((item) => (
							<button
								key={item.label}
								onClick={() => pushSectionParam(item.id)}
								className="text-[#ababab] hover:text-white transition-colors cursor-pointer"
							>
								{item.label}
							</button>
						))}
						<ResponsiveDialog
							open={isDownloadModalOpen}
							onOpenChange={(open) => {
								if (open) {
									handleOpenDownloadModal()
								} else {
									handleCloseDownloadModal()
								}
							}}
						>
							<ResponsiveDialogTrigger asChild>
								<Button variant="green" size="xl">
									Скачать
								</Button>
							</ResponsiveDialogTrigger>
							<ResponsiveDialogContent title="Скачать приложение" className="md:max-w-2xl ">
								{/* md:max-h-[65vh] */}
								<DownloadModalContent />
							</ResponsiveDialogContent>
						</ResponsiveDialog>
					</nav>

					{/* Mobile Menu Button */}
					<ResponsiveDialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
						<ResponsiveDialogTrigger asChild>
							<button className="md:hidden text-white p-2" aria-label="Открыть меню">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 6h16M4 12h16M4 18h16"
									/>
								</svg>
							</button>
						</ResponsiveDialogTrigger>
						<ResponsiveDialogContent
							title="Навигация"
							isTitleHidden
							showCloseButton={false}
							className="md:max-w-178.5 md:h-192"
						>
							<MobileMenuContent
								menuItems={contentBlocks}
								onItemClick={handleMobileMenuClick}
								onDownloadPress={handlePressDownloadInMobileMenu}
							/>
						</ResponsiveDialogContent>
					</ResponsiveDialog>
				</div>
			</Container>
			<motion.div
				className={cn('fixed top-16 lg:top-20 left-0 right-0 bg-white/50 origin-[0%] z-10', {
					hidden: isAnimationLineDisabled
				})}
				style={{
					scaleX,
					height: useTransform(scrollYThrottledProgress, [0, 1], [0.3, 1]),
					willChange: 'transform, height'
				}}
			/>
		</header>
	)
}
