'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { PersonSvg } from '@/components/svg'
import { PATH_TO_IMAGE } from '@/consts/PATH_TO_FILES'
import { cn } from '@/lib/utils'

interface Props {
	avatarFilename?: string | null
	className?: string
	iconSize?: number
	bordered?: boolean
}

const UserAvatar = ({ avatarFilename, className, iconSize, bordered }: Props) => {
	const [imageError, setImageError] = useState(false)

	const isValidAvatar =
		typeof avatarFilename === 'string' &&
		avatarFilename &&
		!avatarFilename.includes('undefined') &&
		!avatarFilename.includes('null')

	if (isValidAvatar && !imageError) {
		return (
			<div
				className={cn('relative rounded-full overflow-hidden', {
					'border border-white/20': bordered
				})}
			>
				<Image
					key={avatarFilename || 'empty'}
					src={`${PATH_TO_IMAGE}${avatarFilename}`}
					alt="avatar"
					width={50}
					height={50}
					className={cn('w-12 h-12 object-cover rounded-full', className)}
					onError={() => setImageError(true)}
				/>
			</div>
		)
	}

	return (
		<div
			className={cn('relative w-12 h-12 flex items-center justify-center rounded-full bg-[#5C5C5C]', className, {
				'border border-white/40': bordered
			})}
		>
			<PersonSvg size={iconSize} />
		</div>
	)
}

export default UserAvatar
