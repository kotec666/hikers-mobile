'use client'
import React from 'react'
import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const scrollDistance = 0 // 1400

function useBoundedScroll(bounds: number) {
	const { scrollY } = useScroll()
	const scrollYBounded = useMotionValue(0)

	useMotionValueEvent(scrollY, 'change', (value) => {
		const previousScrollY = scrollY.getPrevious() || 0
		const scrollYDiff = value - previousScrollY
		scrollYBounded.set(clamp(scrollYBounded.get() + scrollYDiff, 0, bounds))
	})

	const scrollYBoundedProgress = useTransform(scrollYBounded, [0, bounds], [0, 1])

	return { scrollYBoundedProgress }
}

const ScrollProgressLine = ({ isAnimationLineDisabled = true }: { isAnimationLineDisabled?: boolean }) => {
	const { scrollYProgress } = useScroll()

	const scaleX = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001
	})
	const { scrollYBoundedProgress } = useBoundedScroll(scrollDistance)
	const scrollYThrottledProgress = useTransform(scrollYBoundedProgress, [0, 0.25, 1], [0, 0, 1])

	return (
		<motion.div
			className={cn('fixed top-16 lg:top-20 left-0 right-0 bg-white/50 origin-[0%] z-10', {
				hidden: isAnimationLineDisabled
			})}
			style={{
				scaleX,
				height: useTransform(scrollYThrottledProgress, [0, 1], [0.3, 1]),
				willChange: 'transform, height'
			}}
		/>
	)
}

export default ScrollProgressLine
