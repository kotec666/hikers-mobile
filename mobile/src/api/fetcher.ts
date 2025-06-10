import ky from 'ky'
import api from '@/consts/api'
import { Capacitor } from '@capacitor/core'
// import Cookies from "js-cookie";

const fetcher = ky.extend({
    prefixUrl: api + '/api',
    headers: {
        // Authorization: `Bearer ${Cookies.get('token')}`,
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    mode: Capacitor.getPlatform() === 'ios' ? 'cors' : undefined,
    //credentials: "include",
})

export default fetcher
