import NavBarPostsSvg from '@/components/svg/NavBarPostsSvg'
import NavBarMapSvg from '@/components/svg/NavBarMapSvg'
import NavBarAccountSvg from '@/components/svg/NavBarAccountSvg'

export const tabsConfig = [
	{
		id: 'posts',
		route: 'posts', // для NativeTabs
		href: '/posts', // для router и pathname
		label: 'NativeTabs.feedPage',
		icon: NavBarPostsSvg,
		nativeIcon: {
			sf: 'book',
			drawable: 'ic_menu_agenda'
		}
	},
	{
		id: 'newTraining',
		route: 'newTraining', // для NativeTabs
		href: '/newTraining', // для router и pathname
		label: 'NativeTabs.workoutPage',
		icon: NavBarMapSvg,
		nativeIcon: {
			sf: 'globe',
			drawable: 'ic_menu_compass'
		}
	},
	{
		id: 'profile',
		route: 'profile', // для NativeTabs
		href: '/profile', // для router и pathname
		label: 'NativeTabs.profilePage',
		icon: NavBarAccountSvg,
		nativeIcon: {
			sf: 'person',
			drawable: 'ic_menu_myplaces'
		}
		// badge: '+9'
	}
]
