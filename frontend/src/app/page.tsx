import React from 'react'
import { Metadata } from 'next'
import { generateBasicMetadata } from '@/helpers/generateBasicMetadata'
import AboutApp from '@/components/main-page/about-app'
import MainLayout from '@/components/layout/main-layout'
import HeroSection from '@/components/main-page/hero-section'
import { AboutCompany } from '@/components/main-page/about-company'
import { ScreenTextureURL, screenTextureURLs } from '@/consts/PhoneScreenTextures'

export const metadata: Metadata = generateBasicMetadata({
	title: 'Hikers | Приложение для бега, трейлов и хайкинга. Отслеживайте активность, исследуйте маршруты и делитесь достижениями.',
	description:
		'Отслеживайте тренировки, сохраняйте маршруты, анализируйте статистику и делитесь рекордами с сообществом.',
	keywords:
		'trail running, трейлраннинг, бег, пробежки, маршруты для бега, статистика пробежек, gps трекер бега, беговое приложение, running app, hiking, outdoor adventures, trail app, тренировки, спорт, беговое сообщество, маршруты, активный отдых, trail runners, бег по пересечённой местности, велозаезд'
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
				'Записывайте пробежки, сохраняйте маршруты и анализируйте свою активность. Тренируйтесь в своём темпе и становитесь сильнее с каждой пробежкой.'
		},
		{
			id: SectionId.PROGRESS,
			label: 'Публикации',
			title: 'Отслеживайте свой прогресс',
			mobileImg: screenTextureURLs[1],
			description:
				'Фиксируйте дистанции, темп, набор высоты и личные рекорды. Вся статистика и достижения - в одном месте.'
		},
		{
			id: SectionId.COMMUNITY,
			label: 'Сообщество',
			title: 'Присоединяйтесь к сообществу',
			mobileImg: screenTextureURLs[2],
			description:
				'Делитесь рекордами с сообществом, находите единомышленников и вдохновляйтесь новыми маршрутами. Бегать вместе всегда интереснее.'
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
