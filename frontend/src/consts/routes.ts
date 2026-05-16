export const Routes = {
	POSTS: '/posts',
	HISTORY: '/history'
} as const

export type RouteValue = (typeof Routes)[keyof typeof Routes]
