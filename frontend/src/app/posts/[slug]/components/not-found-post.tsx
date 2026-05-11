'use client'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const CARD_COLORS = ['#266678', '#cb7c7a', '#36a18b', '#cda35f', '#747474']
const CARD_OFFSET = 12
const SCALE_FACTOR = 0.05
const INTERVAL_MS = 700

const NotFoundPost = () => {
	const [cards, setCards] = useState(CARD_COLORS)
	const [movingCard, setMovingCard] = useState<string | null>(null)
	const [stage, setStage] = useState<'down' | 'fixed' | 'up' | null>(null)

	useEffect(() => {
		const interval = setInterval(() => {
			setMovingCard(cards[0])
			setStage('down')
			setTimeout(() => setStage('fixed'), 300)
			setTimeout(() => {
				setCards((prev) => {
					const newCards = [...prev]
					const first = newCards.shift()
					if (first !== undefined) newCards.push(first)
					return newCards
				})
				setStage('up')
			}, 450)

			setTimeout(() => {
				setMovingCard(null)
				setStage(null)
			}, 700)
		}, INTERVAL_MS)

		return () => clearInterval(interval)
	}, [cards])

	return (
		<div className="bg-[#212121] rounded-2xl overflow-hidden max-w-2xl mx-auto p-8 text-center text-gray-400 flex flex-col items-center gap-6 relative h-[400px]">
			<motion.h2
				className="text-lg font-medium z-10"
				initial={{ y: -10, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.2 }}
			>
				Пост не найден
			</motion.h2>

			<motion.p
				className="text-sm z-10"
				initial={{ y: 10, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.3 }}
			>
				Этот пост был удалён или ещё не создан
			</motion.p>

			<div className="relative w-full flex justify-center items-center mt-6 h-[260px]">
				<ul className="relative w-64 h-40">
					{cards.map((color, index) => {
						const isMoving = color === movingCard
						let yValue = 0

						if (isMoving) {
							if (stage === 'down') yValue = 10
							else if (stage === 'fixed') yValue = 10
							else if (stage === 'up') yValue = 0
						}

						return (
							<motion.li
								key={color}
								style={{
									backgroundColor: color,
									borderRadius: '8px',
									position: 'absolute',
									width: '100%',
									height: '100%',
									listStyle: 'none',
									transformOrigin: 'top center'
								}}
								animate={{
									top: index * -CARD_OFFSET,
									scale: 1 - index * SCALE_FACTOR,
									zIndex: CARD_COLORS.length - index,
									y: yValue
								}}
								transition={{ duration: 0.3, ease: 'easeInOut' }}
							/>
						)
					})}
				</ul>
			</div>
		</div>
	)
}

export default NotFoundPost
