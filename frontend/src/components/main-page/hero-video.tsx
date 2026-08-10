'use client'
import React, { useEffect, useRef } from 'react'

const HeroVideo = (props: React.VideoHTMLAttributes<HTMLVideoElement>) => {
	const videoRef = useRef<HTMLVideoElement>(null)

	useEffect(() => {
		const video = videoRef.current
		if (!video) return

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					video.play().catch(() => {})
				} else {
					video.pause()
				}
			},
			{ threshold: 0.1 }
		)

		observer.observe(video)
		return () => observer.disconnect()
	}, [])

	return <video ref={videoRef} {...props} />
}

export default HeroVideo