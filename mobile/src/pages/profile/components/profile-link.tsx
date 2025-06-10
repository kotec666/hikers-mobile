import { FC } from 'react'
import { Link, To } from 'react-router-dom'

interface ProfileLinkProps {
    to: To
    children?: React.ReactNode
}

const ProfileLink: FC<ProfileLinkProps> = ({ children, to }) => {
    return (
        <Link
            to={to}
            className="w-full h-[3.25rem] flex justify-between items-center px-5 rounded-3xl hover:bg-neutral-100 transition-all duration-150 ease-out"
        >
            <div className=" flex items-center gap-3 p-text text-neutral-600 font-medium">
                {children}
            </div>
            <svg
                width="8"
                height="14"
                viewBox="0 0 8 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M7.83515 6.62959L1.20467 0.199897C0.790939 -0.201306 5.852e-07 0.0418875 5.62102e-07 0.570303L0 13.4297C-2.30978e-08 13.9581 0.790938 14.2013 1.20467 13.8001L7.83515 7.37041C8.05495 7.15726 8.05495 6.84274 7.83515 6.62959Z"
                    fill="#525252"
                />
            </svg>
        </Link>
    )
}

export default ProfileLink
