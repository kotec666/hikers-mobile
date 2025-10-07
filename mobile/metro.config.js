const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('path')

const config = getDefaultConfig(__dirname)

config.resolver = {
	...config.resolver,
	extraNodeModules: {
		...config.resolver.extraNodeModules,
		shared: path.resolve(__dirname, '../shared'),
		yamap: require.resolve('react-native-yamap-plus-lite')
	},
	unstable_enableSymlinks: true,
	unstable_enablePackageExports: true
}

config.watchFolders = [...(config.watchFolders || []), path.resolve(__dirname, '../shared')]

module.exports = withNativeWind(config, { input: './global.css' })
