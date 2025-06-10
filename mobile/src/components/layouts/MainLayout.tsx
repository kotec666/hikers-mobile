import { FC } from 'react'
import Navbar from '../ordinary/navbar'

interface MainLayoutProps {
    children: React.ReactNode
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
    return (
        <div>
            {children}
            <Navbar />
        </div>
    )
}

export default MainLayout
