import React from 'react'
import StoreButton, { StoreButtonType } from '@/components/ui/store-button'
import GoToSectionButton from '@/components/main-page/go-to-section-button'
import { SectionId } from '@/app/page'

const HeroSection = ({ firstSectionId }: { firstSectionId: SectionId }) => {
	return (
		<section className="h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-5rem)] py-20 md:pb-15 px-4 sm:px-6 lg:px-8 flex flex-col">
			<video
				autoPlay
				loop
				muted
				playsInline
				poster="/images/hikers-poster.avif"
				className="absolute inset-0 w-full h-full object-cover"
			>
				<source src="/video/hikers.webm" type="video/webm" />
				<source src="/video/hikers.mp4" type="video/mp4" />
			</video>
			<div className="absolute inset-0 bg-black/50 z-1" />

			<div className="max-w-4xl mx-auto text-center space-y-8 h-full flex flex-col justify-center items-center z-2">
				<h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white">
					Тренируйся умнее с современным подходом
				</h1>
				<p className="text-[#ababab] text-lg md:text-xl max-w-2xl mx-auto">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
					et dolore magna aliqua.
				</p>

				<div className="flex flex-wrap items-center justify-center gap-4 pt-4">
					<StoreButton type="lg" storeType={StoreButtonType.APP_STORE} />
					<StoreButton type="lg" storeType={StoreButtonType.GOOGLE_PLAY} />
					<StoreButton type="lg" storeType={StoreButtonType.RUSTORE} />
					<StoreButton type="lg" storeType={StoreButtonType.APP_GALLERY} />
				</div>
			</div>
			<div className="mt-auto pt-5 w-full flex justify-center z-2">
				<GoToSectionButton firstSectionId={firstSectionId} />
			</div>
		</section>
	)
}

export default HeroSection
