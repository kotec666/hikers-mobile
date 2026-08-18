#!/usr/bin/env node

/**
 * Sets the Android emulator HTTP proxy so app requests reach a local proxy
 * (VPN/client) running on the host, e.g. Happ on port 10809.
 *
 * Re-run whenever you boot a fresh emulator (the global setting lives per-AVD
 * and resets on newly created ones):
 *   yarn set-emulator-proxy
 *
 * Values come from the environment, else CLI args, else defaults:
 *   EMULATOR_PROXY_HOST=10.0.2.2 EMULATOR_PROXY_PORT=10809 yarn set-emulator-proxy
 *   node scripts/set-emulator-proxy.js --port 10809
 */

const { spawnSync } = require('child_process')
const os = require('os')

const DEFAULT_PROXY_HOST = '10.0.2.2'
const DEFAULT_PROXY_PORT = '10809'

const args = process.argv.slice(2)
function readArg(flag) {
	const index = args.indexOf(flag)
	return index !== -1 ? args[index + 1] : undefined
}

const proxyHost = process.env.EMULATOR_PROXY_HOST || readArg('--host') || DEFAULT_PROXY_HOST
const proxyPort = process.env.EMULATOR_PROXY_PORT || readArg('--port') || DEFAULT_PROXY_PORT
const proxyValue = `${proxyHost}:${proxyPort}`

// Hosts that must always bypass the proxy: the Metro dev server (loopback and
// the real LAN IP). Otherwise the proxy corrupts Metro's chunked/multipart
// bundle responses and breaks the WebSocket.
function getLanIPv4() {
	const interfaces = os.networkInterfaces()
	const isVirtual = /tun|tap|vethernet|virtual|docker|vpn|ppp|wintun|loopback|bluetooth|wi-fi direct/i
	const candidates = []

	for (const [name, addrs] of Object.entries(interfaces)) {
		if (!addrs) continue
		for (const addr of addrs) {
			if (addr.family !== 'IPv4' || addr.internal) continue
			if (addr.address.startsWith('169.254.')) continue
			candidates.push({ name, address: addr.address })
		}
	}

	const real = candidates.filter((c) => !isVirtual.test(c.name))
	const pool = real.length ? real : candidates
	return pool[0]?.address
}

const EXCLUDED_HOSTS = ['localhost', '127.0.0.1', '10.0.2.2', ...(getLanIPv4() ? [getLanIPv4()] : [])].join(',')

function run(args) {
	return spawnSync('adb', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

const listResult = run(['devices'])
if (listResult.error || listResult.status !== 0) {
	console.error('adb not found or failed to run. Make sure Android SDK platform-tools is on PATH.')
	console.error(listResult.stderr || listResult.error?.message)
	process.exit(1)
}

const emulators = listResult.stdout
	.split(/\r?\n/)
	.map((line) => line.split(/\s+/)[0])
	.filter((serial) => serial && serial.includes('emulator'))

if (emulators.length === 0) {
	console.log('No running emulators found (adb devices is empty of emulator-*).')
	process.exit(0)
}

for (const serial of emulators) {
	const current = run(['-s', serial, 'shell', 'settings', 'get', 'global', 'http_proxy'])
	const currentValue = (current.stdout || '').trim()

	if (currentValue === proxyValue) {
		console.log(`[${serial}] proxy already set: ${proxyValue}`)
	} else {
		const putResult = run(['-s', serial, 'shell', 'settings', 'put', 'global', 'http_proxy', proxyValue])
		if (putResult.status === 0) {
			console.log(`[${serial}] proxy set: ${proxyValue}`)
		} else {
			console.error(`[${serial}] failed to set proxy:`, putResult.stderr?.trim())
		}
	}

	const exclusionResult = run([
		'-s',
		serial,
		'shell',
		'settings',
		'put',
		'global',
		'global_http_proxy_exclusion_list',
		EXCLUDED_HOSTS
	])
	if (exclusionResult.status === 0) {
		console.log(`[${serial}] proxy exclusion list set: ${EXCLUDED_HOSTS}`)
	} else {
		console.error(`[${serial}] failed to set proxy exclusion list:`, exclusionResult.stderr?.trim())
	}
}

console.log(`Done. Emulator requests will now go through ${proxyValue}, excluding ${EXCLUDED_HOSTS}.`)
