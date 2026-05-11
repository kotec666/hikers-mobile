import * as React from 'react'

export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = React.useState(false)

	React.useEffect(() => {
		const media = window.matchMedia(query)
		const listener = () => setMatches(media.matches)
		listener()
		media.addEventListener('change', listener)
		return () => media?.removeEventListener('change', listener)
	}, [query])

	return matches
}

// const isMobile = useMediaQuery("(max-width: 768px)")
