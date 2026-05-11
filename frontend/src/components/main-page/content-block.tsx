import { PropsWithChildren, Ref } from 'react'
import { cn } from '@/lib/utils'
import Container from '@/components/layout/container'

interface ContentBlockProps extends PropsWithChildren {
	idx: number // для стилей
	title: string
	description: string
	mobileRef?: Ref<HTMLDivElement>
	desktopRef?: Ref<HTMLDivElement>
}

const ContentBlock = ({ idx, title, description, mobileRef, desktopRef }: ContentBlockProps) => {
	return (
		<section ref={mobileRef}>
			<div className="py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 lg:hidden">
				<div className="w-full">
					{/* Mobile & Tablet - только текст */}
					<div className="lg:hidden max-w-2xl mx-auto space-y-6">
						<h2 className="text-3xl md:text-4xl text-white">{title}</h2>
						<p className="text-[#ababab] text-base md:text-lg leading-relaxed">{description}</p>
					</div>
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
						className={cn('max-w-xs xl:max-w-md  space-y-6', {
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
