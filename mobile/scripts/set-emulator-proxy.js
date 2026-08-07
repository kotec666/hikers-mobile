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
		continue
	}

	const putResult = run(['-s', serial, 'shell', 'settings', 'put', 'global', 'http_proxy', proxyValue])
	if (putResult.status === 0) {
		console.log(`[${serial}] proxy set: ${proxyValue}`)
	} else {
		console.error(`[${serial}] failed to set proxy:`, putResult.stderr?.trim())
	}
}

console.log(`Done. Emulator requests will now go through ${proxyValue}.`)
