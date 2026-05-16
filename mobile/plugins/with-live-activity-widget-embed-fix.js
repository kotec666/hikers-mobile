const { withXcodeProject } = require('@expo/config-plugins')

const EMBED_PHASE_NAME = 'Embed Foundation Extensions'

function withLiveActivityWidgetEmbedFix(config) {
	return withXcodeProject(config, (config) => {
		const copyPhases = config.modResults.hash.project.objects.PBXCopyFilesBuildPhase || {}

		for (const phase of Object.values(copyPhases)) {
			const phaseName = typeof phase?.name === 'string' ? phase.name.replace(/^"|"$/g, '') : ''

			if (!phase || typeof phase !== 'object' || phaseName !== EMBED_PHASE_NAME) {
				continue
			}

			phase.buildActionMask = '2147483647'
			phase.runOnlyForDeploymentPostprocessing = '0'
		}

		return config
	})
}

module.exports = withLiveActivityWidgetEmbedFix
