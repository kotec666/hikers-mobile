const fs = require('fs')
const { withMod, IOSConfig } = require('@expo/config-plugins')
const xcode = require('xcode')

const EMBED_PHASE_NAME = 'Embed Foundation Extensions'
const SUPPORTED_LOCALIZATIONS = ['ru']

function withLiveActivityWidgetEmbedFix(config) {
	return withMod(config, {
		platform: 'ios',
		mod: 'finalized',
		action(config) {
			const pbxPath = IOSConfig.Paths.getPBXProjectPath(config.modRequest.projectRoot)

			const project = xcode.project(pbxPath)
			project.parseSync()

			const copyPhases = project.hash.project.objects.PBXCopyFilesBuildPhase || {}
			for (const phase of Object.values(copyPhases)) {
				const name = typeof phase?.name === 'string' ? phase.name.replace(/^"|"$/g, '') : ''
				if (name !== EMBED_PHASE_NAME) continue

				phase.buildActionMask = '2147483647'
				phase.runOnlyForDeploymentPostprocessing = '0'
			}

			const pbxProjects = project.hash.project.objects.PBXProject || {}
			for (const pbxProject of Object.values(pbxProjects)) {
				if (!Array.isArray(pbxProject.knownRegions)) continue
				for (const locale of SUPPORTED_LOCALIZATIONS) {
					if (!pbxProject.knownRegions.includes(locale)) {
						pbxProject.knownRegions.push(locale)
					}
				}
			}

			fs.writeFileSync(pbxPath, project.writeSync())

			return config
		}
	})
}

module.exports = withLiveActivityWidgetEmbedFix
