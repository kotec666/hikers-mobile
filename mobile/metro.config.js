const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('path')

const config = getDefaultConfig(__dirname)

// Extra node modules
config.resolver = {
	...config.resolver,
	extraNodeModules: {
		...config.resolver.extraNodeModules,
		shared: path.resolve(__dirname, '../shared')
		// yamap: path.resolve(__dirname, 'node_modules/react-native-yamap-plus') // можно убрать
	}
	// unstable_enableSymlinks: true,
	// unstable_enablePackageExports: true // временно отключаем
}

// Watch folders
config.watchFolders = [...(config.watchFolders || []), path.resolve(__dirname, '../shared')]

module.exports = withNativeWind(config, { input: './global.css' })
