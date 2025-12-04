import ky from 'ky'
import { env } from '@/consts/env'

const baseFetcher = ky.extend({
	prefixUrl: env.api + '/api'
	//credentials: "include",
})

const fetcher = baseFetcher.extend({})

export default fetcher
