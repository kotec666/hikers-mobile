import React from 'react'
import Image from 'next/image'
import { env } from '@/consts/env'
import Link from 'next/link'
import { AppGallerySmallSvg, AppStoreSmallSvg, GooglePlaySmallSvg, RustoreSmallSvg } from '@/components/svg'
import { cn } from '@/lib/utils'

export enum StoreButtonType {
	APP_STORE = 'APP_STORE',
	GOOGLE_PLAY = 'GOOGLE_PLAY',
	RUSTORE = 'RUSTORE',
	APP_GALLERY = 'APP_GALLERY'
}

interface IStoreButtonProps {
	storeType: StoreButtonType
	type: 'lg' | 'sm'
	shrink?: boolean
}

const data = {
	app_store: {
		icon: '/svg/app-store-l.svg',
		title: 'Скачать приложение хайкерс в App Store',
		link: env.app_store_link,
		smallComponent: <AppStoreSmallSvg />
	},
	google_play: {
		icon: '/svg/google-play-l.svg',
		title: 'Скачать приложение хайкерс в Google Play',
		link: env.google_play_link,
		smallComponent: <GooglePlaySmallSvg />
	},
	rustore: {
		icon: '/svg/rustore-l.svg',
		title: 'Скачать приложение хайкерс в RuStore',
		link: env.rustore_link,
		smallComponent: <RustoreSmallSvg />
	},
	app_gallery: {
		icon: '/svg/app-gallery-l.svg',
		title: 'Скачать приложение хайкерс в AppGallery',
		link: env.app_gallery_link,
		smallComponent: <AppGallerySmallSvg />
	}
}

const StoreButton = ({ storeType, type, shrink = true }: IStoreButtonProps) => {
	const getComponentData = () => {
		switch (storeType) {
			case StoreButtonType.APP_STORE:
				return data.app_store
			case StoreButtonType.GOOGLE_PLAY:
				return data.google_play
			case StoreButtonType.RUSTORE:
				return data.rustore
			case StoreButtonType.APP_GALLERY:
				return data.app_gallery
			default:
				return data.google_play
		}
	}

	const componentData = getComponentData()

	if (!componentData.link) return null
	return (
		<Link
			className={cn('block', {
				'w-37.5 h-12.5 shrink-0': type === 'lg' && shrink,
				'max-w-37.5 h-auto': type === 'lg' && !shrink
			})}
			title={componentData.title}
			aria-label={componentData.title}
			href={componentData.link}
			target="_blank"
			rel="noopener noreferrer"
			prefetch={false}
		>
			{type === 'lg' ? (
				<Image
					className="w-full h-full object-contain"
					src={componentData.icon}
					alt=""
					width={150}
					height={50}
					draggable={false}
				/>
			) : (
				componentData.smallComponent
			)}
		</Link>
	)
}

export default StoreButton
