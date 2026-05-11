import React from 'react'
import AppStoreSvg from '@/assets/svg/app-store-l.svg'
import GooglePlaySvg from '@/assets/svg/google-play-l.svg'
import RustoreSvg from '@/assets/svg/rustore-l.svg'
import AppGallerySvg from '@/assets/svg/app-gallery-l.svg'
import Image from 'next/image'

export enum StoreButtonType {
	APP_STORE = 'APP_STORE',
	GOOGLE_PLAY = 'GOOGLE_PLAY',
	RUSTORE = 'RUSTORE',
	APP_GALLERY = 'APP_GALLERY'
}

interface IStoreButtonProps {
	type: StoreButtonType
}

const StoreButtonLg = ({ type }: IStoreButtonProps) => {
	const getComponentData = () => {
		switch (type) {
			case StoreButtonType.APP_STORE:
				return {
					icon: AppStoreSvg,
					title: 'Скачать приложение хайкерс в App Store',
					link: '#app-store'
				}
			case StoreButtonType.GOOGLE_PLAY:
				return {
					icon: GooglePlaySvg,
					title: 'Скачать приложение хайкерс в Google Play',
					link: '#google-play'
				}
			case StoreButtonType.RUSTORE:
				return {
					icon: RustoreSvg,
					title: 'Скачать приложение хайкерс в RuStore',
					link: '#ru-store'
				}
			case StoreButtonType.APP_GALLERY:
				return {
					icon: AppGallerySvg,
					title: 'Скачать приложение хайкерс в AppGallery',
					link: '#app-gallery'
				}
		}
	}

	const componentData = getComponentData()

	return (
		<a href={componentData.link} className="block">
			<Image
				title={componentData.title}
				alt={componentData.title}
				src={componentData.icon}
				width={148}
				height={44}
				draggable={false}
			/>
		</a>
	)
}

export default StoreButtonLg
