import { PropsWithChildren, Ref } from 'react'
import { cn } from '@/lib/utils'
import Container from '@/components/layout/container'
import Image from 'next/image'
import phoneFrame from '@/assets/images/phone-frame.png'
import { ScreenTextureURL } from '@/consts/PhoneScreenTextures'

interface ContentBlockProps extends PropsWithChildren {
	idx: number // для стилей
	title: string
	description: string
	mobileImg: ScreenTextureURL
	mobileRef?: Ref<HTMLDivElement>
	desktopRef?: Ref<HTMLDivElement>
}

const ContentBlock = ({ idx, title, description, mobileImg, mobileRef, desktopRef }: ContentBlockProps) => {
	return (
		<section ref={mobileRef}>
			<div className="flex flex-col gap-10 py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 lg:hidden">
				<div className="w-full">
					{/* Mobile & Tablet */}
					<div className="lg:hidden max-w-2xl mx-auto space-y-6">
						<h2 className="text-3xl md:text-4xl text-white">{title}</h2>
						<p className="text-[#ababab] text-base md:text-lg leading-relaxed">{description}</p>
					</div>
				</div>
				<div className="mx-auto relative w-full max-w-80 aspect-880/1800 overflow-hidden">
					<Image
						fill
						src={phoneFrame}
						alt="Скриншот приложения хайкерс"
						className="object-contain"
						style={{
							backgroundImage: `url(${mobileImg})`,
							backgroundPosition: '-7% 85%',
							backgroundSize: '190%',
							backgroundRepeat: 'no-repeat'
						}}
						priority
					/>
				</div>
			</div>
			<div
				ref={desktopRef}
				className="hidden lg:flex flex-col absolute justify-center items-center text-white h-dvh w-full"
				style={{
					top: `${idx * 100}dvh`
				}}
			>
				<Container className="w-full flex-1 flex items-center">
					<div
						className={cn('max-w-75 xl:max-w-md  space-y-6', {
							'mr-auto': idx % 2 === 0,
							'ml-auto': idx % 2 !== 0
						})}
					>
						<h2 className="text-3xl xl:text-4xl 2xl:text-5xl text-white">{title}</h2>
						<p className="text-[#ababab] text-base xl:text-lg leading-relaxed">{description}</p>
					</div>
				</Container>
			</div>
		</section>
	)
}
ContentBlock.displayName = 'ContentBlock'

export default ContentBlock
