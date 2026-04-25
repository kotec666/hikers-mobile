console.log('RUNNING LOCAL PROPERTIES SCRIPT')

const fs = require('fs')
const path = require('path')
const os = require('os')

// eslint-disable-next-line no-undef
const projectRoot = path.join(__dirname, '..')
const androidPath = path.join(projectRoot, 'android')
const localPropertiesPath = path.join(androidPath, 'local.properties')

if (!fs.existsSync(androidPath)) {
	console.error('❌ android folder not found')
	process.exit(1)
}

let sdkDir =
	process.env.ANDROID_HOME ||
	process.env.ANDROID_SDK_ROOT ||
	path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk')

const content = `sdk.dir=${sdkDir.replace(/\\/g, '\\\\')}`

fs.writeFileSync(localPropertiesPath, content)

console.log('✅ local.properties created')
console.log('📍 Path:', localPropertiesPath)
console.log('📦 SDK:', sdkDir)
