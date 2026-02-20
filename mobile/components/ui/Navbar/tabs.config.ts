import NavBarPostsSvg from '@/components/svg/NavBarPostsSvg'
import NavBarMapSvg from '@/components/svg/NavBarMapSvg'
import NavBarAccountSvg from '@/components/svg/NavBarAccountSvg'

export const tabsConfig = [
	{
		id: 'posts',
		href: '/posts',
		label: 'Посты',
		icon: NavBarPostsSvg,
		nativeIcon: {
			sf: 'book',
			drawable: 'ic_menu_agenda'
		}
	},
	{
		id: 'newTraining',
		href: '/newTraining',
		label: 'Тренировка',
		icon: NavBarMapSvg,
		nativeIcon: {
			sf: 'globe',
			drawable: 'ic_menu_compass'
		}
	},
	{
		id: 'profile',
		href: '/profile',
		label: 'Профиль',
		icon: NavBarAccountSvg,
		nativeIcon: {
			sf: 'person',
			drawable: 'ic_menu_myplaces'
		},
		badge: '+9'
	}
]
