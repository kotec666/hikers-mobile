'use client'
import * as React from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
	Drawer,
	DrawerTrigger,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerFooter,
	DrawerTitle,
	DrawerDescription
} from '@/components/ui/drawer'
import {
	Dialog,
	DialogTrigger,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription
} from '@/components/ui/dialog'

function ResponsiveDialog({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Root | typeof DrawerPrimitive.Root>) {
	const isMobile = useMediaQuery('(max-width: 768px)')

	return isMobile ? <Drawer {...props} /> : <Dialog {...props} />
}

function ResponsiveDialogTrigger({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger | typeof DrawerPrimitive.Trigger>) {
	const isMobile = useMediaQuery('(max-width: 768px)')

	return isMobile ? <DrawerTrigger {...props} /> : <DialogTrigger {...props} />
}

function ResponsiveDialogClose({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Close | typeof DrawerPrimitive.Close>) {
	const isMobile = useMediaQuery('(max-width: 768px)')

	return isMobile ? <DrawerClose {...props} /> : <DialogClose {...props} />
}

function ResponsiveDialogContent({
	showCloseButton,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Content | typeof DrawerPrimitive.Content> & {
	showCloseButton?: boolean
	isTitleHidden?: boolean
}) {
	const isMobile = useMediaQuery('(max-width: 768px)')

	return isMobile ? <DrawerContent {...props} /> : <DialogContent showCloseButton={showCloseButton} {...props} />
}

function ResponsiveDialogHeader({ ...props }: React.ComponentProps<'div'>) {
	const isMobile = useMediaQuery('(max-width: 768px)')

	return isMobile ? <DrawerHeader {...props} /> : <DialogHeader {...props} />
}

function ResponsiveDialogFooter({ ...props }: React.ComponentProps<'div'>) {
	const isMobile = useMediaQuery('(max-width: 768px)')

	return isMobile ? <DrawerFooter {...props} /> : <DialogFooter {...props} />
}

function ResponsiveDialogTitle({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Title | typeof DrawerPrimitive.Title>) {
	const isMobile = useMediaQuery('(max-width: 768px)')

	return isMobile ? <DrawerTitle {...props} /> : <DialogTitle {...props} />
}

function ResponsiveDialogDescription({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Description | typeof DrawerPrimitive.Description>) {
	const isMobile = useMediaQuery('(max-width: 768px)')

	return isMobile ? <DrawerDescription {...props} /> : <DialogDescription {...props} />
}

export {
	ResponsiveDialog,
	ResponsiveDialogClose,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogFooter,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	ResponsiveDialogTrigger
}
