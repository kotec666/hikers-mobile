import { useEffect, useState } from "react"
import {useUserStore} from "@/store/user.ts"
import {auth} from "@/api/auth.ts"
import {User} from "@/types/interfaces";

type UseAuth = {
    (): [User, boolean];
    loaded: boolean;
};
const useAuth: UseAuth = () => {
    const [loaded, setLoaded] = useState(useAuth.loaded);
    const user = useUserStore(state => state.user)
    const setUser = useUserStore(state => state.setUser)

    useEffect(() => {
        if (!useAuth.loaded && Object.keys(user).length === 0) {
            (async () => {
                try {
                    const userData = await auth()
                    setUser(userData)
                    setLoaded(true)
                    useAuth.loaded = true
                } catch (e) {
                    console.log("Not authenticated", e)
                    setLoaded(true)
                    useAuth.loaded = true
                }
            })()
        }
    }, [])

    return [user, loaded]
}

useAuth.loaded = false

export default useAuth
