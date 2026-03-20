'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const YMapLoader = () => {
	const dots = [0, 1, 2]

	return (
		<div className="flex w-full h-full items-center justify-center bg-gray-50 dark:bg-gray-900">
			<div className="flex space-x-2">
				<AnimatePresence>
					{dots.map((i) => (
						<motion.span
							key={i}
							className="block w-4 h-4 bg-green-main rounded-full"
							animate={{
								scale: [0.5, 1.2, 0.5],
								opacity: [0.5, 1, 0.5]
							}}
							transition={{
								duration: 1,
								repeat: Infinity,
								repeatDelay: 0.2,
								delay: i * 0.2
							}}
						/>
					))}
				</AnimatePresence>
			</div>
		</div>
	)
}

export default YMapLoader
