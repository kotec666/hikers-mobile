export const Routes = {
	POSTS: '/posts',
	HISTORY: '/history',
	APP_STORE: 'https://apps.apple.com/ru/app/subway-surfers/id512939461',
	GOOGLE_PLAY: 'https://play.google.com/store/apps/details?id=com.kiloo.subwaysurf'
} as const

export type RouteValue = (typeof Routes)[keyof typeof Routes]
