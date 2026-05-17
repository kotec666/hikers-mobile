'use client'
import React from 'react'
import { motion, Variants } from 'framer-motion'
import { SectionId } from '@/app/page'

interface IGoToSectionButtonProps {
	firstSectionId?: SectionId
}

const GoToSectionButton = (props: IGoToSectionButtonProps) => {
	const firstArrow: Variants = {
		rest: {
			y: 0,
			transition: {
				duration: 0.4,
				type: 'tween',
				ease: 'easeOut',
				delay: 0.1
			}
		},
		hover: {
			y: 3,
			transition: {
				duration: 0.4,
				type: 'tween',
				ease: 'easeOut',
				delay: 0.1
			}
		}
	}

	const secondArrow: Variants = {
		rest: {
			y: 0,
			transition: {
				duration: 0.4,
				ease: 'easeOut'
			}
		},
		hover: {
			y: 3,
			transition: {
				duration: 0.4,
				ease: 'easeOut'
			}
		}
	}

	return (
		<motion.a
			aria-label="Перейти к следующему разделу"
			href={`#${props.firstSectionId}`}
			animate={{ y: [0, 5, 0] }}
			transition={{
				duration: 1.2,
				repeat: Infinity,
				ease: 'easeInOut',
				delay: 0.2
			}}
		>
			<motion.svg
				aria-hidden="true"
				initial="rest"
				whileHover="hover"
				animate="rest"
				className="border-none active:border-none active:ring-0 active:outline-none focus:border-none focus:ring-0 focus:outline-none max-w-9 max-h-9 tablet:max-w-[40px] tablet:max-h-[40px]"
				whileTap={{ scale: 0.8 }}
				width="40"
				height="40"
				viewBox="0 0 40 40"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<circle cx="18" cy="18" r="16.6667" stroke="white" strokeWidth="1.4" />
				<motion.path
					d="M13 12.1666L18 17.1666L23 12.1666"
					stroke="white"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					variants={firstArrow}
				/>
				<motion.path
					d="M13 18.8334L18 23.8334L23 18.8334"
					stroke="white"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					variants={secondArrow}
				/>
			</motion.svg>
		</motion.a>
	)
}

export default GoToSectionButton
