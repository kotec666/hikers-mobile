import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useRef, useCallback } from 'react'

export default function useAppendSearchParam() {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const queueRef = useRef(Promise.resolve())

	const updateParams = useCallback(
		(paramsUpdater: (params: URLSearchParams) => void) => {
			queueRef.current = queueRef.current.then(() => {
				const currentParams = new URLSearchParams(searchParams.toString())

				paramsUpdater(currentParams)

				const query = currentParams.toString()
				const url = query ? `${pathname}?${query}` : pathname

				router.replace(url)

				return Promise.resolve()
			})
		},
		[router, pathname, searchParams]
	)

	const appendSearchParam = useCallback(
		(name: string, value: string) => {
			updateParams((params) => {
				if (!value) {
					params.delete(name)
				} else {
					params.set(name, value)
				}
			})
		},
		[updateParams]
	)

	const appendSearchParams = useCallback(
		(paramsObj: Record<string, string>) => {
			updateParams((params) => {
				for (const [name, value] of Object.entries(paramsObj)) {
					if (!value) {
						params.delete(name)
					} else {
						params.set(name, value)
					}
				}
			})
		},
		[updateParams]
	)

	return [appendSearchParam, appendSearchParams] as const
}
