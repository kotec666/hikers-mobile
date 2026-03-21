import { AppleSvg, GooglePlaySvg } from '@/app/components/svg'
import Image from 'next/image'
import icon from '@/assets/images/icon-40x40.png'
import { Routes } from '@/consts/routes'
import { headers } from 'next/headers'

enum DeviceType {
	android = 'android',
	ios = 'ios',
	pc = 'pc'
}

const RedirectComponentAppStore = () => {
	return (
		<a
			href={Routes.APP_STORE}
			className="bg-[#2c2c2c] hover:bg-[#3c3c3c] text-nowrap text-white text-xs md:text-base px-4 py-2.5 rounded-full font-medium transition-colors flex items-center gap-2"
		>
			<AppleSvg className="text-white" />
			App Store
		</a>
	)
}

const RedirectComponentGooglePlay = () => {
	return (
		<a
			href={Routes.GOOGLE_PLAY}
			className="bg-[#4CAF50] hover:bg-[#45a049] text-nowrap text-white text-xs md:text-base px-4 py-2.5 rounded-full font-medium transition-colors flex items-center gap-2"
		>
			<GooglePlaySvg className="text-white" />
			Google Play
		</a>
	)
}

export async function SharePageHeader() {
	const headersList = await headers()
	const userAgent = headersList.get('user-agent')?.toLowerCase() || ''
	let device: DeviceType = DeviceType.pc
	if (/android/.test(userAgent)) device = DeviceType.android
	else if (/iphone|ipad|ipod/.test(userAgent)) device = DeviceType.ios

	return (
		<header className="bg-[#1a1a1a] border-b border-[#2c2c2c] sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="min-w-10 w-10 min-h-10 h-10">
						<Image
							src={icon}
							alt="иконка приложения"
							className="w-full h-full object-cover"
							draggable="false"
						/>
					</div>
					<div>
						<h1 className="text-white font-semibold text-lg">Hikers</h1>
						<p className="text-gray-400 text-xs">Поделись своими достижениями</p>
					</div>
				</div>
				{device === DeviceType.pc && (
					<div className="flex items-center gap-2">
						<RedirectComponentAppStore />
						<RedirectComponentGooglePlay />
					</div>
				)}
				{device === DeviceType.ios && <RedirectComponentAppStore />}
				{device === DeviceType.android && <RedirectComponentGooglePlay />}
			</div>
		</header>
	)
}
