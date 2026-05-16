import React, { PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'

interface IContainerProps extends PropsWithChildren {
	className?: string
}

const Container = ({ className, children }: IContainerProps) => {
	return <div className={cn('px-4 sm:px-6 lg:px-8 max-w-335 4xl:max-w-450 mx-auto', className)}>{children}</div>
}

export default Container
