'use client'

import * as React from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FullscreenViewerProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	header?: React.ReactNode
	children: React.ReactNode
	className?: string
}

/**
 * Edge-to-edge fullscreen viewer used for the image lightbox and the map viewer.
 * Built on the unstyled Radix Dialog primitives (portal, focus trap, Escape-to-close,
 * scroll lock) so it inherits accessible behaviour "for free", but with its own
 * fully custom, immersive presentation instead of the boxed <DialogContent />.
 */
export function FullscreenViewer({ open, onOpenChange, title, header, children, className }: FullscreenViewerProps) {
	const reduceMotion = useReducedMotion()

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<AnimatePresence>
				{open && (
					<DialogPrimitive.Portal forceMount>
						<DialogPrimitive.Overlay asChild forceMount>
							<motion.div
								className="fixed inset-0 z-100 bg-black"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.32, 0.72, 0, 1] }}
							/>
						</DialogPrimitive.Overlay>

						<DialogPrimitive.Content
							forceMount
							onOpenAutoFocus={(e) => e.preventDefault()}
							className={cn('fixed inset-0 z-101 flex flex-col outline-none', className)}
						>
							<VisuallyHidden asChild>
								<DialogPrimitive.Title>{title}</DialogPrimitive.Title>
							</VisuallyHidden>
							<VisuallyHidden asChild>
								<DialogPrimitive.Description>{title}</DialogPrimitive.Description>
							</VisuallyHidden>

							<motion.div
								className="flex flex-col h-full w-full"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: reduceMotion ? 0 : 0.2, delay: reduceMotion ? 0 : 0.05 }}
							>
								<div
									className="flex items-center justify-between gap-4 px-4 sm:px-6 shrink-0 relative z-10"
									style={{
										paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
										paddingBottom: '0.75rem'
									}}
								>
									<div className="flex-1 min-w-0">{header}</div>
									<DialogPrimitive.Close asChild>
										<button
											type="button"
											aria-label="Закрыть"
											className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-white/10 hover:bg-white/15 active:scale-90 transition-all duration-150 backdrop-blur-md"
										>
											<X className="w-5 h-5 text-white" strokeWidth={2} />
										</button>
									</DialogPrimitive.Close>
								</div>

								<div className="flex-1 min-h-0 relative">{children}</div>
							</motion.div>
						</DialogPrimitive.Content>
					</DialogPrimitive.Portal>
				)}
			</AnimatePresence>
		</DialogPrimitive.Root>
	)
}
