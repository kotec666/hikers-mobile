import * as React from 'react'
import PortalHost from '@/components/Portal/PortalHost'

export type Props = {
	children: React.ReactNode
}

const PortalProvider = (props: Props) => {
	const { children } = props

	return <PortalHost>{children}</PortalHost>
}

export default PortalProvider
