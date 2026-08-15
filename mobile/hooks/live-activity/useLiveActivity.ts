import { useCallback, useMemo, useState } from 'react'
import { Platform } from 'react-native'
import type {
	ActivityInfo,
	LiveActivityEndEvent,
	LiveActivityUpdateEvent,
	PendingWidgetAction,
	TimerState,
	WidgetCompleteEvent
} from '@/modules/expo-live-activity'
import * as liveActivities from '@/modules/expo-live-activity'

export type LiveActivityState = 'unsupported' | 'unavailable' | 'supported' | 'unknown'

export interface TimerStatus {
	state: TimerState
	elapsedTime: number
}

export { TimerState } from '@/modules/expo-live-activity'
export type {
	ActivityInfo,
	LiveActivityEndEvent,
	LiveActivityUpdateEvent,
	PendingWidgetAction,
	WidgetCompleteEvent
} from '@/modules/expo-live-activity'
export type LiveActivityEventName =
	| 'onLiveActivityUpdate'
	| 'onLiveActivityEnd'
	| 'onWidgetCompleteActivity'
	| 'onWidgetAction'

export const ActivityIcons = {
	WALKING: '🚶',
	RUNNING: '🏃',
	BIKING: '🚴',
	WORKOUT: '💪'
}

export type ActivityIconType = keyof typeof ActivityIcons

interface UseLiveActivityReturn {
	isSupported: boolean
	liveActivityState: LiveActivityState
	timerStatus: TimerStatus
	activeActivities: ActivityInfo[]

	startActivity: (options: { activityName: string; activityIcon: ActivityIconType }) => Promise<string | null>
	pauseActivity: () => Promise<boolean>
	resumeActivity: () => Promise<boolean>
	endActivity: (activityId?: string) => Promise<boolean>

	updateStatus: () => Promise<TimerStatus>
	consumePendingWidgetAction: () => PendingWidgetAction | null
	addListener: (
		eventName: LiveActivityEventName,
		callback: (
			event: LiveActivityUpdateEvent | LiveActivityEndEvent | WidgetCompleteEvent | PendingWidgetAction
		) => void
	) => { remove: () => void }

	getElapsedTime: () => number
	isRunning: () => boolean

	isLiveActivityAvailable: boolean
	liveActivityId: string | null
}

const isIOS = Platform.OS === 'ios'

function getInitialLiveActivityState(): {
	liveActivityState: LiveActivityState
	activeActivities: ActivityInfo[]
} {
	if (!isIOS) {
		return { liveActivityState: 'unsupported', activeActivities: [] }
	}

	try {
		const available = liveActivities.isLiveActivityAvailable()
		if (!available) {
			return { liveActivityState: 'unavailable', activeActivities: [] }
		}

		try {
			const activities = liveActivities.getActiveActivities()
			return { liveActivityState: 'supported', activeActivities: activities }
		} catch (error) {
			console.error('Error getting active activities:', error)
			return { liveActivityState: 'supported', activeActivities: [] }
		}
	} catch (error) {
		console.error('Error checking Live Activity availability:', error)
		return { liveActivityState: 'unavailable', activeActivities: [] }
	}
}

// @TODO не используется
export function useLiveActivity(): UseLiveActivityReturn {
	const [initial] = useState(getInitialLiveActivityState)
	const [liveActivityState] = useState<LiveActivityState>(initial.liveActivityState)
	const [liveActivityId, setLiveActivityId] = useState<string | null>(null)
	const [activeActivities, setActiveActivities] = useState<ActivityInfo[]>([])
	const [timerStatus, setTimerStatus] = useState<TimerStatus>({
		state: 'finished',
		elapsedTime: 0
	})

	const isSupported = useMemo(() => {
		if (!isIOS) return false

		const isStringPlatformVersion = typeof Platform.Version === 'string'
		const platformVersion = isStringPlatformVersion
			? parseInt(Platform.Version as string)
			: Number(Platform.Version)

		return platformVersion >= 16.2
	}, [])

	const isLiveActivityAvailable = liveActivityState === 'supported'

	const updateActiveActivities = useCallback(async () => {
		if (!isIOS || liveActivityState !== 'supported') {
			return []
		}

		try {
			const activities = liveActivities.getActiveActivities()
			setActiveActivities(activities)
			return activities
		} catch (error) {
			console.error('Error getting active activities:', error)
			return []
		}
	}, [liveActivityState])

	const updateStatus = useCallback(async (): Promise<TimerStatus> => {
		if (!isIOS || liveActivityState !== 'supported') {
			return { state: 'finished', elapsedTime: 0 }
		}

		try {
			const status = await liveActivities.getTimerStatus()
			const simplifiedStatus = {
				state: status.state,
				elapsedTime: status.elapsedTime
			}
			setTimerStatus(simplifiedStatus)
			return simplifiedStatus
		} catch (error) {
			console.error('Error getting timer status:', error)
			return { state: 'finished', elapsedTime: 0 }
		}
	}, [liveActivityState])

	const consumePendingWidgetAction = useCallback((): PendingWidgetAction | null => {
		if (!isIOS || liveActivityState !== 'supported') {
			return null
		}

		return liveActivities.consumePendingWidgetAction()
	}, [liveActivityState])

	const startActivity = useCallback(
		async (options: { activityName: string; activityIcon: ActivityIconType }): Promise<string | null> => {
			if (!isIOS || liveActivityState !== 'supported') {
				return null
			}

			try {
				const activityType = options.activityIcon.toLowerCase()

				const activityId = await liveActivities.startLiveActivity(options.activityName, activityType, {
					timeRunning: '',
					timePaused: '',
					distance: '',
					speed: '',
					averageSpeed: '',
					speedUnit: ''
				})

				if (activityId) {
					setLiveActivityId(activityId)
					setTimerStatus({
						state: 'active',
						elapsedTime: 0
					})
					await updateActiveActivities()
					return activityId
				}
				return null
			} catch (error) {
				console.error('Error starting Live Activity:', error)
				return null
			}
		},
		[liveActivityState, updateActiveActivities]
	)

	const pauseActivity = useCallback(async (): Promise<boolean> => {
		if (!isIOS || liveActivityState !== 'supported' || !liveActivityId) {
			return false
		}

		try {
			const success = await liveActivities.pauseLiveActivity(liveActivityId)

			if (success) {
				setTimerStatus((current) => ({
					...current,
					state: 'paused'
				}))
			}

			return success
		} catch (error) {
			console.error('Error pausing Live Activity:', error)
			return false
		}
	}, [liveActivityState, liveActivityId])

	const resumeActivity = useCallback(async (): Promise<boolean> => {
		if (!isIOS || liveActivityState !== 'supported' || !liveActivityId) {
			return false
		}

		try {
			const success = await liveActivities.resumeLiveActivity(liveActivityId)

			if (success) {
				setTimerStatus((current) => ({
					...current,
					state: 'active'
				}))
			}

			return success
		} catch (error) {
			console.error('Error resuming Live Activity:', error)
			return false
		}
	}, [liveActivityState, liveActivityId])

	const endActivity = useCallback(
		async (activityId?: string): Promise<boolean> => {
			const targetActivityId = activityId || liveActivityId

			if (!isIOS || liveActivityState !== 'supported' || !targetActivityId) {
				return false
			}

			try {
				const success = await liveActivities.endLiveActivity(targetActivityId)

				if (success) {
					setTimerStatus({
						state: 'finished',
						elapsedTime: 0
					})
					setLiveActivityId(null)
					await updateActiveActivities()
				}

				return success
			} catch (error) {
				console.error('Error ending Live Activity:', error)
				return false
			}
		},
		[liveActivityState, liveActivityId, updateActiveActivities]
	)

	const addListener = useCallback(
		(
			eventName: LiveActivityEventName,
			callback: (
				event: LiveActivityUpdateEvent | LiveActivityEndEvent | WidgetCompleteEvent | PendingWidgetAction
			) => void
		) => {
			if (!isIOS || !liveActivities.addListener) {
				return { remove: () => {} }
			}

			try {
				return liveActivities.addListener(eventName, (event) => {
					if (eventName === 'onLiveActivityUpdate') {
						const updateEvent = event as LiveActivityUpdateEvent
						setTimerStatus({
							state: updateEvent.state,
							elapsedTime: updateEvent.elapsedTime
						})
					} else if (eventName === 'onLiveActivityEnd') {
						setTimerStatus({
							state: 'finished',
							elapsedTime: 0
						})
						setLiveActivityId(null)
						updateActiveActivities()
					}

					callback(event)
				})
			} catch (error) {
				console.error(`Error adding listener for ${eventName}:`, error)
				return { remove: () => {} }
			}
		},
		[updateActiveActivities]
	)

	const getElapsedTime = useCallback(() => timerStatus.elapsedTime, [timerStatus])
	const isRunning = useCallback(() => timerStatus.state === 'active', [timerStatus])

	return {
		isSupported,
		liveActivityState,
		timerStatus,
		activeActivities,
		startActivity,
		pauseActivity,
		resumeActivity,
		endActivity,
		updateStatus,
		consumePendingWidgetAction,
		addListener,
		getElapsedTime,
		isRunning,
		isLiveActivityAvailable,
		liveActivityId
	}
}
