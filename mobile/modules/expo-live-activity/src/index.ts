import { requireOptionalNativeModule } from 'expo-modules-core'
import { Platform } from 'react-native'

type ExpoLiveActivityModule = {
	isLiveActivityAvailable: () => boolean
	startActivity: (
		activityName: string,
		activityIcon: string,
		labels: LiveActivityLabels,
		startedAtTimestamp?: number,
		pausedAtTimestamp?: number
	) => Promise<string>
	pauseActivity: (activityId?: string) => Promise<boolean>
	resumeActivity: (activityId?: string) => Promise<boolean>
	updateActivity: (
		activityId: string | null,
		distanceText: string,
		speedText: string,
		averageSpeedText: string,
		lastLocationTimestamp: number,
		labels: LiveActivityLabels
	) => Promise<boolean>
	endActivity: (activityId?: string) => Promise<boolean>
	getTimerStatus: () => Promise<TimerStatus>
	getActiveActivities: () => ActivityInfo[]
	consumePendingWidgetAction: () => PendingWidgetAction | null
	addListener: (eventType: string, listener: (event: any) => void) => Subscription
}

let ExpoLiveActivity: ExpoLiveActivityModule | null = null

if (Platform.OS === 'ios') {
	ExpoLiveActivity = requireOptionalNativeModule<ExpoLiveActivityModule>('ExpoLiveActivityModule')
}

export type TimerState = 'active' | 'paused' | 'finished'

export interface LiveActivityUpdateEvent {
	state: TimerState
	elapsedTime: number
	activityId: string
	lastLocationTimestamp?: number
	distanceText: string
	speedText: string
	averageSpeedText: string
}

export interface LiveActivityEndEvent {
	id: string
	endedAt: number
}

export interface WidgetCompleteEvent {
	activityId: string
	elapsedTime: number
}

export interface TimerStatus {
	state: TimerState
	activityId: string
	elapsedTime: number
	lastLocationTimestamp?: number
	distanceText?: string
	speedText?: string
	averageSpeedText?: string
}

export interface ActivityInfo {
	id: string
	activityName: string
}

export interface LiveActivityLabels {
	timeRunning: string
	timePaused: string
	distance: string
	speed: string
	averageSpeed: string
	speedUnit: string
}

export interface LiveActivityMetrics {
	distanceText: string
	speedText: string
	averageSpeedText: string
	lastLocationTimestamp?: number
	labels?: LiveActivityLabels
}

export interface PendingWidgetAction {
	action: 'pause' | 'resume' | 'complete'
	activityId: string
	elapsedTime: number
	createdAt: number
}

interface Subscription {
	remove: () => void
}

export function isLiveActivityAvailable(): boolean {
	if (!ExpoLiveActivity) return false

	try {
		return ExpoLiveActivity.isLiveActivityAvailable()
	} catch (error) {
		console.error('[LiveActivities] Error checking availability:', error)
		return false
	}
}

export async function startLiveActivity(
	activityName: string,
	activityIcon: string,
	labels: LiveActivityLabels,
	startedAtTimestamp?: number,
	pausedAtTimestamp?: number | null
): Promise<string> {
	if (!ExpoLiveActivity) {
		console.warn('[LiveActivities] Module not available.')
		return ''
	}
	try {
		return await ExpoLiveActivity.startActivity(
			activityName,
			activityIcon,
			labels,
			startedAtTimestamp,
			pausedAtTimestamp ?? undefined
		)
	} catch (error) {
		console.error('[LiveActivities] Error starting activity:', error)
		return ''
	}
}

export async function pauseLiveActivity(activityId?: string): Promise<boolean> {
	if (!ExpoLiveActivity) return false

	try {
		return await ExpoLiveActivity.pauseActivity(activityId)
	} catch (error) {
		console.error('[LiveActivities] Error pausing activity:', error)
		return false
	}
}

export async function resumeLiveActivity(activityId?: string): Promise<boolean> {
	if (!ExpoLiveActivity) return false

	try {
		return await ExpoLiveActivity.resumeActivity(activityId)
	} catch (error) {
		console.error('[LiveActivities] Error resuming activity:', error)
		return false
	}
}

export async function updateLiveActivityMetrics(metrics: LiveActivityMetrics, activityId?: string): Promise<boolean> {
	if (!ExpoLiveActivity) return false

	const labels = metrics.labels ?? {
		timeRunning: '',
		timePaused: '',
		distance: '',
		speed: '',
		averageSpeed: '',
		speedUnit: ''
	}

	try {
		return await ExpoLiveActivity.updateActivity(
			activityId ?? null,
			metrics.distanceText,
			metrics.speedText,
			metrics.averageSpeedText,
			metrics.lastLocationTimestamp ?? 0,
			labels
		)
	} catch (error) {
		console.error('[LiveActivities] Error updating activity:', error)
		return false
	}
}

export async function endLiveActivity(activityId?: string): Promise<boolean> {
	if (!ExpoLiveActivity) return false

	try {
		return await ExpoLiveActivity.endActivity(activityId)
	} catch (error) {
		console.error('[LiveActivities] Error ending activity:', error)
		return false
	}
}

export async function getTimerStatus(): Promise<TimerStatus> {
	if (!ExpoLiveActivity) {
		return {
			state: 'finished',
			activityId: '',
			elapsedTime: 0
		}
	}

	try {
		const status = await ExpoLiveActivity.getTimerStatus()
		if (!['active', 'paused', 'finished'].includes(status.state)) {
			console.warn(`[LiveActivities] Received unexpected state: ${status.state}`)
			status.state = 'finished'
		}
		return status as TimerStatus
	} catch (error) {
		console.error('[LiveActivities] Error getting timer status:', error)
		return {
			state: 'finished',
			activityId: '',
			elapsedTime: 0
		}
	}
}

export function getActiveActivities(): ActivityInfo[] {
	if (!ExpoLiveActivity) return []

	try {
		const activities = ExpoLiveActivity.getActiveActivities()
		return activities.map((act: any) => ({
			id: act.id,
			activityName: act.activityName
		})) as ActivityInfo[]
	} catch (error) {
		console.error('[LiveActivities] Error getting active activities:', error)
		return []
	}
}

export function consumePendingWidgetAction(): PendingWidgetAction | null {
	if (!ExpoLiveActivity) return null

	try {
		const pendingAction = ExpoLiveActivity.consumePendingWidgetAction()
		if (!pendingAction) return null

		if (!['pause', 'resume', 'complete'].includes(pendingAction.action)) {
			console.warn(`[LiveActivities] Received unexpected widget action: ${pendingAction.action}`)
			return null
		}

		return pendingAction
	} catch (error) {
		console.error('[LiveActivities] Error consuming pending widget action:', error)
		return null
	}
}

export function addListener(
	eventType: 'onLiveActivityUpdate' | 'onLiveActivityEnd' | 'onWidgetCompleteActivity' | 'onWidgetAction',
	listener: (
		event: LiveActivityUpdateEvent | LiveActivityEndEvent | WidgetCompleteEvent | PendingWidgetAction
	) => void
): Subscription {
	if (!ExpoLiveActivity) {
		return {
			remove: () => {}
		}
	}

	return ExpoLiveActivity.addListener(eventType, listener)
}

export default {
	isLiveActivityAvailable,
	startLiveActivity,
	pauseLiveActivity,
	resumeLiveActivity,
	updateLiveActivityMetrics,
	endLiveActivity,
	getTimerStatus,
	getActiveActivities,
	consumePendingWidgetAction,
	addListener
}
