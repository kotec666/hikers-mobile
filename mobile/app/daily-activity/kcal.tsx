import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'
import { Page } from '@/components/ui/Page'
import { Container } from '@/components/ui/Container'
import BlurProvider from '@/components/providers/BlurProvider'
import ActivityGoalSchedule from '@/components/activity-rings/bottom-sheets/ActivityGoalSchedule'
import ActivityGoalEveryDay from '@/components/activity-rings/bottom-sheets/ActivityGoalEveryDay'
import ActivityGoalToday from '@/components/activity-rings/bottom-sheets/ActivityGoalToday'
import { generateMonthsRange, WEEKDAY_I18N_KEYS } from '@/helpers/calendar'
import { LngShort } from '@/store/languageStorage'
import ActivityGoalPerMonth from '@/components/activity-rings/bottom-sheets/ActivityGoalPerMonth'
import PagerView from 'react-native-pager-view'
import { canGoNextDay, canGoNextWeek, TODAY } from '@/helpers/date'
import { addDays, addWeeks, isAfter, isSameDay } from 'date-fns'
import ActivityRingsHeader from '@/components/activity-rings/ActivityRingsHeader'
import ActivityPageMainContent from '@/components/activity-rings/ActivityPageMainContent'
import BottomSheet, { BottomSheetHandle } from '@/components/ui/BottomSheet/BottomSheet'
import { useTranslation } from 'react-i18next'

export interface DayGoal {
	day: string
	label: string
	goal: number
}
type BottomSheetType = 'today' | 'everyday' | 'schedule' | 'perMonth' | null
enum BottomSheetTypes {
	TODAY = 'today',
	EVERY_DAY = 'everyday',
	SCHEDULE = 'schedule',
	PER_MONTH = 'perMonth'
}

// calendar generator settings
const INITIAL_PAST_MONTHS = 2
const FUTURE_MONTHS = 1
const LOAD_MORE_STEP = 6

// min/max limit for kcal picker
const MIN_CALORIE_LIMIT = 10
const MAX_CALORIE_LIMIT = 9990

const SCHEDULE_INITIAL_GOALS = [200, 200, 250, 200, 200, 200, 200]

const Kcal = () => {
	const { t, i18n } = useTranslation()
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

	const bottomSheetRef = useRef<BottomSheetHandle>(null)

	const weekPagerRef = useRef<PagerView>(null)
	const dayPagerRef = useRef<PagerView>(null)

	const [selectedDate, setSelectedDate] = useState(new Date())

	const [bottomSheetType, setBottomSheetType] = useState<BottomSheetType>(null)
	const [pastMonthsCount, setPastMonthsCount] = useState(INITIAL_PAST_MONTHS)
	const [goals, setGoals] = useState<number[]>(SCHEDULE_INITIAL_GOALS)

	const schedule = useMemo<DayGoal[]>(
		() =>
			WEEKDAY_I18N_KEYS.map((key, index) => ({
				day: t(`DailyActivity.weekdaysShort.${key}`),
				label: t(`DailyActivity.weekdaysLong.${key}`),
				goal: goals[index]
			})),
		[goals, t]
	)

	const isToday = useMemo(() => {
		return isSameDay(selectedDate, TODAY)
	}, [selectedDate])

	const { months, currentMonthIndex } = useMemo(() => {
		return generateMonthsRange(-pastMonthsCount, FUTURE_MONTHS, i18n.language as LngShort)
	}, [pastMonthsCount, i18n.language])

	const canSwipeNextDay = useMemo(() => {
		return canGoNextDay(selectedDate)
	}, [selectedDate])

	const canSwipeNextWeek = useMemo(() => {
		return canGoNextWeek(selectedDate)
	}, [selectedDate])

	const handleDayPageSelected = (e: any) => {
		const position = e.nativeEvent.position

		// current
		if (position === 1) return

		// prev
		if (position === 0) {
			setSelectedDate((prev) => addDays(prev, -1))
		}

		// next disabled
		if (position === 2 && !canSwipeNextDay) {
			requestAnimationFrame(() => {
				dayPagerRef.current?.setPageWithoutAnimation(1)
			})

			return
		}

		// next enabled
		if (position === 2 && canSwipeNextDay) {
			setSelectedDate((prev) => addDays(prev, 1))
		}

		requestAnimationFrame(() => {
			dayPagerRef.current?.setPageWithoutAnimation(1)
		})
	}

	const handleWeekPageSelected = (e: any) => {
		const position = e.nativeEvent.position

		if (position === 1) return

		if (position === 0) {
			setSelectedDate((prev) => addWeeks(prev, -1))
		}

		if (position === 2 && canSwipeNextWeek) {
			setSelectedDate((prev) => {
				const nextDate = addWeeks(prev, 1)

				// не даём уйти в future
				if (isAfter(nextDate, TODAY)) {
					return TODAY
				}

				return nextDate
			})
		}

		requestAnimationFrame(() => {
			weekPagerRef.current?.setPageWithoutAnimation(1)
		})
	}

	const handleLoadMoreMonths = () => {
		setPastMonthsCount((prev) => prev + LOAD_MORE_STEP)
	}

	const openBottomSheet = useCallback(async () => {
		await bottomSheetRef.current?.openSheet()
	}, [])

	const handlePressHeaderCalendar = async () => {
		setBottomSheetType(BottomSheetTypes.PER_MONTH)
		await openBottomSheet()
	}

	const handlePressChangeGoal = async () => {
		setBottomSheetType(BottomSheetTypes.EVERY_DAY)
		await openBottomSheet()
	}

	const handlePressChangeGoalToday = async () => {
		setBottomSheetType(BottomSheetTypes.TODAY)
		await openBottomSheet()
	}

	const handlePressChangeGoalSchedule = async () => {
		setBottomSheetType(BottomSheetTypes.SCHEDULE)
		await openBottomSheet()
	}

	const updateGoal = (index: number, delta: number) => {
		setGoals((prev) =>
			prev.map((goal, i) =>
				i === index ? Math.max(MIN_CALORIE_LIMIT, Math.min(MAX_CALORIE_LIMIT, goal + delta)) : goal
			)
		)
	}

	const onLongPressStart = (idx: number, delta: number) => {
		updateGoal(idx, delta) // первый тик сразу

		intervalRef.current = setInterval(() => {
			updateGoal(idx, delta)
		}, 300)
	}

	const onLongPressStop = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
			intervalRef.current = null
		}
	}

	const [dayNeighborsReady, setDayNeighborsReady] = useState(false)
	useEffect(() => {
		const id = requestAnimationFrame(() => setDayNeighborsReady(true))
		return () => cancelAnimationFrame(id)
	}, [])

	const renderPage = (key: string, pageIsToday: boolean, isActive: boolean) => {
		if (!isActive && !dayNeighborsReady) {
			return <View key={key} style={{ width: '100%', height: '100%' }} />
		}

		return (
			<View style={{ width: '100%', height: '100%' }} key={key}>
				<Container className="flex-1">
					<ActivityPageMainContent
						handlePressChangeGoalToday={handlePressChangeGoalToday}
						handlePressChangeGoalSchedule={handlePressChangeGoalSchedule}
						handlePressChangeGoal={handlePressChangeGoal}
						isToday={pageIsToday}
					/>
				</Container>
			</View>
		)
	}

	const renderEmptyPage = (key: string) => <View key={key} style={{ width: '100%', height: '100%' }} />

	const isBigSheet = bottomSheetType === BottomSheetTypes.PER_MONTH || bottomSheetType === BottomSheetTypes.SCHEDULE
	return (
		<Page edges={['bottom']}>
			<BlurProvider>
				<BottomSheet ref={bottomSheetRef} detents={isBigSheet ? [1] : [0.5]} scrollable={isBigSheet}>
					{bottomSheetType === BottomSheetTypes.TODAY && (
						<ActivityGoalToday
							currentGoal={goals[0]}
							updateGoal={updateGoal}
							onLongPressStart={onLongPressStart}
							onLongPressStop={onLongPressStop}
						/>
					)}

					{bottomSheetType === BottomSheetTypes.EVERY_DAY && (
						<ActivityGoalEveryDay
							currentGoal={goals[0]}
							updateGoal={updateGoal}
							onLongPressStart={onLongPressStart}
							onLongPressStop={onLongPressStop}
						/>
					)}

					<ActivityGoalPerMonth
						months={months}
						currentMonthIndex={currentMonthIndex}
						onLoadMore={handleLoadMoreMonths}
						isVisible={bottomSheetType === BottomSheetTypes.PER_MONTH}
					/>

					<ActivityGoalSchedule
						schedule={schedule}
						updateGoal={updateGoal}
						onLongPressStart={onLongPressStart}
						onLongPressStop={onLongPressStop}
						isVisible={bottomSheetType === BottomSheetTypes.SCHEDULE}
					/>
				</BottomSheet>

				<ActivityRingsHeader
					weekPagerRef={weekPagerRef}
					selectedDate={selectedDate}
					handlePressHeaderCalendar={handlePressHeaderCalendar}
					handleWeekPageSelected={handleWeekPageSelected}
					setSelectedDate={setSelectedDate}
					canSwipeNextWeek={canSwipeNextWeek}
				/>

				<PagerView
					ref={dayPagerRef}
					style={{ flex: 1 }}
					initialPage={1}
					onPageSelected={handleDayPageSelected}
					overScrollMode="never"
				>
					{renderPage('prev', false, false)}
					{renderPage('current', isToday, true)}
					{canSwipeNextDay ? renderPage('next', false, false) : renderEmptyPage('next')}
				</PagerView>
			</BlurProvider>
		</Page>
	)
}

export default Kcal
