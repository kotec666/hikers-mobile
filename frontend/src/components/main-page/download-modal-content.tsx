import React from 'react'
import Image from 'next/image'
import qrCode from '@/assets/images/qr-code.webp'
import StoreButton, { StoreButtonType } from '@/components/ui/store-button'

const DownloadModalContent = () => {
	return (
		<div className="space-y-8 pb-4">
			<div className="text-center">
				<p className="text-[#ababab]">Выберите ваш магазин приложений</p>
			</div>
			<div className="grid grid-cols-1 place-items-center sm:place-items-stretch sm:grid-cols-2 gap-4">
				<div className="flex justify-end">
					<StoreButton type="lg" storeType={StoreButtonType.APP_STORE} />
				</div>
				<div className="flex justify-start">
					<StoreButton type="lg" storeType={StoreButtonType.GOOGLE_PLAY} />
				</div>
				<div className="flex justify-end">
					<StoreButton type="lg" storeType={StoreButtonType.RUSTORE} />
				</div>
				<div className="flex justify-start">
					<StoreButton type="lg" storeType={StoreButtonType.APP_GALLERY} />
				</div>
			</div>
			<div className="flex flex-col items-center space-y-4 pt-4">
				<p className="text-[#ababab] text-sm">Или отсканируйте QR-код</p>
				<div className="w-48 h-48 bg-white rounded-2xl p-4 flex items-center justify-center relative">
					<Image src={qrCode} alt="qr код" className="w-full h-full object-contain" draggable="false" />
				</div>
				<p className="text-xs text-[#ababab] text-center max-w-50">
					Сканируйте для быстрого доступа к приложению
				</p>
			</div>
		</div>
	)
}

export default DownloadModalContent
