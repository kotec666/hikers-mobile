import React from 'react'
import AppStoreSvg from '@/assets/svg/app-store-l.svg'
import GooglePlaySvg from '@/assets/svg/google-play-l.svg'
import RustoreSvg from '@/assets/svg/rustore-l.svg'
import AppGallerySvg from '@/assets/svg/app-gallery-l.svg'
import Image from 'next/image'
import { env } from '@/consts/env'
import Link from 'next/link'
import { AppGallerySmallSvg, AppStoreSmallSvg, GooglePlaySmallSvg, RustoreSmallSvg } from '@/components/svg'

export enum StoreButtonType {
	APP_STORE = 'APP_STORE',
	GOOGLE_PLAY = 'GOOGLE_PLAY',
	RUSTORE = 'RUSTORE',
	APP_GALLERY = 'APP_GALLERY'
}

interface IStoreButtonProps {
	storeType: StoreButtonType
	type: 'lg' | 'sm'
}

const StoreButton = ({ storeType, type }: IStoreButtonProps) => {
	const data = {
		app_store: {
			icon: AppStoreSvg,
			title: 'Скачать приложение хайкерс в App Store',
			link: env.app_store_link,
			smallComponent: <AppStoreSmallSvg />
		},
		google_play: {
			icon: GooglePlaySvg,
			title: 'Скачать приложение хайкерс в Google Play',
			link: env.google_play_link,
			smallComponent: <GooglePlaySmallSvg />
		},
		rustore: {
			icon: RustoreSvg,
			title: 'Скачать приложение хайкерс в RuStore',
			link: env.rustore_link,
			smallComponent: <RustoreSmallSvg />
		},
		app_gallery: {
			icon: AppGallerySvg,
			title: 'Скачать приложение хайкерс в AppGallery',
			link: env.app_gallery_link,
			smallComponent: <AppGallerySmallSvg />
		}
	}
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
		<Link href={componentData.link} target="_blank" className="block">
			{type === 'lg' ? (
				<Image
					title={componentData.title}
					alt={componentData.title}
					src={componentData.icon}
					width={148}
					height={44}
					draggable={false}
				/>
			) : (
				componentData.smallComponent
			)}
		</Link>
	)
}

export default StoreButton
