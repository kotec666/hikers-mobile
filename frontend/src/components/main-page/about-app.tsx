import React from 'react'
import { IContentBlock } from '@/app/page'
import ContentBlock from '@/components/main-page/content-block'
import PhoneSceneLazy from '@/components/main-page/phone-scene-lazy'

const AboutApp = ({ contentBlocks }: { contentBlocks: IContentBlock[] }) => {
	return (
		<div id="phone-scene-container" className="relative w-full lg:h-[300dvh]">
			{contentBlocks.map((block, idx) => (
				<ContentBlock
					key={block.id}
					id={block.id}
					mobileImg={block.mobileImg}
					idx={idx}
					title={block.title}
					description={block.description}
				/>
			))}
			<div role="presentation" className="hidden lg:flex sticky z-10 top-0 h-screen w-full">
				<PhoneSceneLazy />
			</div>
		</div>
	)
}

export default AboutApp
