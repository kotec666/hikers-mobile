import React from 'react'
import { Metadata } from 'next'
import { generateBasicMetadata } from '@/helpers/generateBasicMetadata'
import AboutApp from '@/components/main-page/about-app'
import MainLayout from '@/components/layout/main-layout'
import HeroSection from '@/components/main-page/hero-section'
import { AboutCompany } from '@/components/main-page/about-company'
import { ScreenTextureURL, screenTextureURLs } from '@/consts/PhoneScreenTextures'
import { env } from '@/consts/env'
import Script from 'next/script'

export const metadata: Metadata = generateBasicMetadata({
	title: 'Hikers | Приложение для бега, велозаездов и хайкинга. Отслеживайте активность, исследуйте маршруты и делитесь достижениями.',
	description:
		'Отслеживайте тренировки, сохраняйте маршруты, анализируйте статистику и делитесь рекордами с сообществом.',
	keywords:
		'trail running, трейлраннинг, бег, пробежки, маршруты для бега, статистика пробежек, gps трекер бега, беговое приложение, приложение для бега, приложение для велосипеда, running app, hiking, outdoor adventures, trail app, тренировки, спорт, беговое сообщество, маршруты, активный отдых, trail runners, бег по пересечённой местности, велозаезд, велосипед'
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
			<Script
				id="main-page-ld"
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						'@context': 'https://schema.org',
						'@graph': [
							{
								'@type': 'WebSite',
								'@id': `${env.web_url}/#website`,
								url: env.web_url,
								name: 'Hikers',
								inLanguage: 'ru',
								description:
									'Приложение для бега, велоезды, трейлраннинга и хайкинга с GPS-трекером, записью маршрутов и статистикой тренировок.',
								publisher: {
									'@id': `${env.web_url}/#organization`
								}
							},

							{
								'@type': 'Organization',
								'@id': `${env.web_url}/#organization`,
								name: 'Hikers',
								url: env.web_url,
								logo: {
									'@type': 'ImageObject',
									url: `${env.web_url}/images/icon-40x40.png`
								}
							},

							{
								'@type': 'WebPage',
								'@id': `${env.web_url}/#webpage`,
								url: env.web_url,
								name: 'Hikers - приложение для бега, велоезды, трейлов и хайкинга',
								isPartOf: {
									'@id': `${env.web_url}/#website`
								},
								about: {
									'@id': `${env.web_url}/#app`
								},
								primaryImageOfPage: {
									'@type': 'ImageObject',
									url: `${env.web_url}/opengraph-image.png`
								},
								description:
									'Записывайте тренировки с GPS, отслеживайте маршруты, анализируйте статистику и делитесь активностью с сообществом.'
							},

							{
								'@type': ['SoftwareApplication', 'MobileApplication'],
								'@id': `${env.web_url}/#app`,
								name: 'Hikers',
								applicationCategory: 'HealthApplication',
								applicationSubCategory: [
									'Running',
									'Cycling',
									'Trail Running',
									'Hiking',
									'Fitness Tracking',
									'GPS Navigation',
									'Бег',
									'Велосипед',
									'Трейлраннинг',
									'Хайкинг',
									'Фитнес-трекер',
									'GPS-навигация'
								],
								operatingSystem: ['iOS', 'Android'],
								url: env.web_url,
								installUrl: env.app_store_link,
								downloadUrl: env.google_play_link,
								image: `${env.web_url}/icon192_rounded.png`,
								sameAs: [env.tg_link, env.tt_link, env.vk_link],
								publisher: {
									'@id': `${env.web_url}/#organization`
								},
								author: {
									'@id': `${env.web_url}/#organization`
								},
								offers: {
									'@type': 'Offer',
									price: '0',
									priceCurrency: 'RUB'
								},
								featureList: [
									'GPS-запись тренировок',
									'Отслеживание пробежек',
									'Трекинг маршрутов',
									'Статистика темпа и дистанции',
									'Хайкинг',
									'Трейлраннинг',
									'Сохранение тренировок',
									'Велозаезды',
									'История активности',
									'Социальные публикации'
								]
							}
						]
					})
				}}
			/>
		</MainLayout>
	)
}
