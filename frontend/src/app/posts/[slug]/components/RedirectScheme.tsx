'use client'
import { useEffect } from 'react'

const RedirectScheme = ({ scheme, postId }: { scheme: string; postId?: string }) => {
	useEffect(() => {
		if (postId) {
			window.location.href = `${scheme}${postId}`
		}
	}, [postId, scheme])
	return null
}

export default RedirectScheme
