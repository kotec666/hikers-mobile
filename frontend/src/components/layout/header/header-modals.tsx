'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { ResponsiveDialog, ResponsiveDialogContent, ResponsiveDialogTrigger } from '@/components/ui/responsive-dialog'
import DownloadModalContent from '@/components/main-page/download-modal-content'
import { MobileMenuContent } from '@/components/layout/mobile-menu'
import BurgerSvg from '@/components/svg/burger-svg'
import { useCallback, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import useAppendSearchParam from '@/hooks/useAppendSearchParam'
import { IContentBlock } from '@/app/page'

export interface IHeaderModalsProps {
	contentBlocks?: IContentBlock[]
}

const HeaderModals = ({ contentBlocks }: IHeaderModalsProps) => {
	const searchParams = useSearchParams()
	const [appendSearchParam] = useAppendSearchParam()
	const action = searchParams.get('action')

	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(action === 'download')

	const handleOpenDownloadModal = useCallback(() => {
		setIsDownloadModalOpen(true)
		appendSearchParam('action', 'download')
	}, [appendSearchParam])

	const handleCloseDownloadModal = () => {
		setIsDownloadModalOpen(false)
		appendSearchParam('action', '')
	}

	const handleMobileMenuClick = () => {
		setIsMobileMenuOpen(false)
	}

	const handlePressDownloadInMobileMenu = () => {
		setIsMobileMenuOpen(false)
		handleOpenDownloadModal()
	}

	return (
		<>
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
					<Button variant="green" size="xl" className="hidden md:flex">
						Скачать
					</Button>
				</ResponsiveDialogTrigger>
				<ResponsiveDialogContent title="Скачать приложение" className="md:max-w-2xl">
					<DownloadModalContent />
				</ResponsiveDialogContent>
			</ResponsiveDialog>
			<ResponsiveDialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
				<ResponsiveDialogTrigger asChild>
					<button className="md:hidden text-white p-2" aria-label="Открыть меню">
						<BurgerSvg />
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
		</>
	)
}

export default HeaderModals
