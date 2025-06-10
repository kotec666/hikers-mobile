import React from "react"
import useAuth from "@/hooks/useAuth"
import {Navigate} from "react-router-dom"
import {UserRoles} from "@/types/interfaces";

interface Props extends React.PropsWithChildren {
    availableRoles?: UserRoles[]
    redirectTo?: string
    nonAuthorizedAccess?: boolean // use "true" if authorized user cannot access the page
}

const AuthProvider = (props: Props) => {
    const [user, loaded] = useAuth()

    if (props.nonAuthorizedAccess && Object.keys(user).length !== 0 && loaded) {
        return <Navigate to={props.redirectTo || "/"}/>
    }

    if (!props.nonAuthorizedAccess && Object.keys(user).length === 0 && loaded) {
        return <Navigate to={props.redirectTo || "/"}/>
    }

    // if available roles exist - check if user has one of the roles - if not - redirect
    if (props.availableRoles && !props?.availableRoles?.includes(user?.role?.id) && loaded) {
        return <Navigate to={props.redirectTo || "/"}/>
    }

    if (loaded) return <>{props.children}</>
}

export default AuthProvider
