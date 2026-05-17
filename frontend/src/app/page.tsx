import React from 'react'
import { Metadata } from 'next'
import { generateBasicMetadata } from '@/helpers/generateBasicMetadata'
import AboutApp from '@/components/main-page/about-app'
import MainLayout from '@/components/layout/main-layout'
import HeroSection from '@/components/main-page/hero-section'
import { AboutCompany } from '@/components/main-page/about-company'
import { ScreenTextureURL, screenTextureURLs } from '@/consts/PhoneScreenTextures'

export const metadata: Metadata = generateBasicMetadata({
	title: 'Hikers - мобильное приложение',
	description:
		'Хайкерс это мобильное приложения для тренировок разного типа с современным подходом к тренировкам и здоровью в целом',
	keywords: 'ключевые, слова, через, запятую, хайкерс, тренировка, hikers, mobile, app, приложение, здоровье, фитнес'
})

export enum SectionId {
	TRAININGS = 'trainings',
	PROGRESS = 'progress',
	COMMUNITY = 'community'
}

export interface IContentBlock {
	id: SectionId
	label: string
	title: string
	mobileImg: ScreenTextureURL
	description: string
}

export default function Home() {
	const contentBlocks: IContentBlock[] = [
		{
			id: SectionId.TRAININGS,
			label: 'Тренировки',
			title: 'Персональные тренировки для вас',
			mobileImg: screenTextureURLs[0],
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud.'
		},
		{
			id: SectionId.PROGRESS,
			label: 'Публикации',
			title: 'Отслеживайте свой прогресс',
			mobileImg: screenTextureURLs[1],
			description:
				'Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.'
		},
		{
			id: SectionId.COMMUNITY,
			label: 'Сообщество',
			title: 'Присоединяйтесь к сообществу',
			mobileImg: screenTextureURLs[2],
			description:
				'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error.'
		}
	]

	return (
		<MainLayout
			headerProps={{
				isAnimationLineDisabled: false,
				contentBlocks
			}}
			edges={[]}
			mainClassName="bg-black-0d"
		>
			<HeroSection firstSectionId={contentBlocks[0].id} />
			<AboutApp contentBlocks={contentBlocks} />
			<AboutCompany />
		</MainLayout>
	)
}
