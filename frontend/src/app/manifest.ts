import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'Hikers',
		short_name: 'Hikers',
		description: 'Тренируйтесь на природе, отслеживайте активность и сохраняйте маршруты с Hikers.',
		start_url: '/',
		scope: '/',
		display: 'standalone',
		orientation: 'any',
		dir: 'auto',
		lang: 'ru',
		background_color: '#0d0d0d',
		theme_color: '#0d0d0d',
		icons: [
			{
				src: '/icon512_maskable.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'maskable'
			},
			{
				src: '/icon512_rounded.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'any'
			},
			{
				src: '/icon192_maskable.png',
				sizes: '192x192',
				type: 'image/png',
				purpose: 'maskable'
			},
			{
				src: '/icon192_rounded.png',
				sizes: '192x192',
				type: 'image/png',
				purpose: 'any'
			}
		]
	}
}
