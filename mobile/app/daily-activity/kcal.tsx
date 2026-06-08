import React, { useCallback, useMemo, useRef, useState } from 'react'
import { View, Dimensions } from 'react-native'
import { Page } from '@/components/ui/Page'
import { Container } from '@/components/ui/Container'
import BlurProvider from '@/components/providers/BlurProvider'
import ActivityGoalSchedule from '@/components/activity-rings/bottom-sheets/ActivityGoalSchedule'
import ActivityGoalEveryDay from '@/components/activity-rings/bottom-sheets/ActivityGoalEveryDay'
import ActivityGoalToday from '@/components/activity-rings/bottom-sheets/ActivityGoalToday'
import { generateMonthsRange } from '@/helpers/calendar'
import ActivityGoalPerMonth from '@/components/activity-rings/bottom-sheets/ActivityGoalPerMonth'
import BottomSheet from '@/components/ui/BottomSheet/BottomSheet'
import BottomSheetResizable, {
	BottomSheetResizableRef,
	SNAP_POINT_INDEX
} from '@/components/ui/BottomSheetResizable/BottomSheetResizable'
import { BottomSheetHandle } from '@/components/ui/BottomSheet/types'
import PagerView from 'react-native-pager-view'
import { canGoNextDay, canGoNextWeek } from '@/helpers/date'
import { addDays, addWeeks } from 'date-fns'
import ActivityRingsHeader from '@/components/activity-rings/ActivityRingsHeader'
import ActivityPageMainContent from '@/components/activity-rings/ActivityPageMainContent'

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

const { height: screenHeight } = Dimensions.get('screen')

const SCHEDULE_INITIAL_DATA = [
	{ day: 'Пн', label: 'Понедельник', goal: 200 },
	{ day: 'Вт', label: 'Вторник', goal: 200 },
	{ day: 'Ср', label: 'Среда', goal: 250 },
	{ day: 'Чт', label: 'Четверг', goal: 200 },
	{ day: 'Пт', label: 'Пятница', goal: 200 },
	{ day: 'Сб', label: 'Суббота', goal: 200 },
	{ day: 'Вс', label: 'Воскресенье', goal: 200 }
]

const Kcal = () => {
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

	const bottomSheetRef = useRef<BottomSheetHandle>(null)
	const bottomSheetResizableRef = useRef<BottomSheetResizableRef>(null)

	const weekPagerRef = useRef<PagerView>(null)
	const dayPagerRef = useRef<PagerView>(null)

	const [selectedDate, setSelectedDate] = useState(new Date())

	const [bottomSheetType, setBottomSheetType] = useState<BottomSheetType>(null)
	const [pastMonthsCount, setPastMonthsCount] = useState(INITIAL_PAST_MONTHS)
	const [schedule, setSchedule] = useState<DayGoal[]>(SCHEDULE_INITIAL_DATA)

	const { months, currentMonthIndex } = useMemo(() => {
		return generateMonthsRange(-pastMonthsCount, FUTURE_MONTHS)
	}, [pastMonthsCount])

	const canSwipeNextDay = useMemo(() => {
		return canGoNextDay(selectedDate)
	}, [selectedDate])

	const canSwipeNextWeek = useMemo(() => {
		return canGoNextWeek(selectedDate)
	}, [selectedDate])

	const handleDayPageSelected = (e: any) => {
		const position = e.nativeEvent.position

		// center
		if (position === 1) return

		// prev day
		if (position === 0) {
			setSelectedDate((prev) => addDays(prev, -1))
		}

		// next day
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
			setSelectedDate((prev) => addWeeks(prev, 1))
		}

		requestAnimationFrame(() => {
			weekPagerRef.current?.setPageWithoutAnimation(1)
		})
	}

	const handleLoadMoreMonths = () => {
		setPastMonthsCount((prev) => prev + LOAD_MORE_STEP)
	}

	const openBottomSheet = useCallback(() => {
		bottomSheetRef.current?.openSheet()
	}, [])

	const openResizableBottomSheet = useCallback(() => {
		bottomSheetResizableRef.current?.open()
	}, [])

	const handlePressHeaderCalendar = async () => {
		setBottomSheetType(BottomSheetTypes.PER_MONTH)
		openResizableBottomSheet()
	}

	const handlePressChangeGoal = () => {
		setBottomSheetType(BottomSheetTypes.EVERY_DAY)
		openBottomSheet()
	}

	const handlePressChangeGoalToday = () => {
		setBottomSheetType(BottomSheetTypes.TODAY)
		openBottomSheet()
	}

	const handlePressChangeGoalSchedule = () => {
		setBottomSheetType(BottomSheetTypes.SCHEDULE)
		openResizableBottomSheet()
	}

	const updateGoal = (index: number, delta: number) => {
		setSchedule((prev) =>
			prev.map((item, i) =>
				i === index
					? {
							...item,
							goal: Math.max(MIN_CALORIE_LIMIT, Math.min(MAX_CALORIE_LIMIT, item.goal + delta))
						}
					: item
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

	return (
		<Page edges={['bottom']}>
			<BlurProvider>
				<BottomSheet ref={bottomSheetRef} activeHeight={screenHeight * 0.5}>
					{bottomSheetType === BottomSheetTypes.TODAY && (
						<ActivityGoalToday
							currentGoal={schedule[0].goal}
							updateGoal={updateGoal}
							onLongPressStart={onLongPressStart}
							onLongPressStop={onLongPressStop}
						/>
					)}

					{bottomSheetType === BottomSheetTypes.EVERY_DAY && (
						<ActivityGoalEveryDay
							currentGoal={schedule[0].goal}
							updateGoal={updateGoal}
							onLongPressStart={onLongPressStart}
							onLongPressStop={onLongPressStop}
						/>
					)}
				</BottomSheet>
				<BottomSheetResizable ref={bottomSheetResizableRef} initialSnapIndex={SNAP_POINT_INDEX.MAX}>
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
				</BottomSheetResizable>

				{/*<ScrollView stickyHeaderIndices={[0]} showsVerticalScrollIndicator={false}> @TODO fixed header */}
				<ActivityRingsHeader
					weekPagerRef={weekPagerRef}
					selectedDate={selectedDate}
					handlePressHeaderCalendar={handlePressHeaderCalendar}
					handleWeekPageSelected={handleWeekPageSelected}
					setSelectedDate={setSelectedDate}
				/>

				<PagerView
					ref={dayPagerRef}
					style={{ flex: 1 }}
					initialPage={1}
					onPageSelected={handleDayPageSelected}
					scrollEnabled
				>
					<View style={{ width: '100%', height: '100%' }} key="prev">
						<Container className="flex-1">
							<ActivityPageMainContent
								handlePressChangeGoalToday={handlePressChangeGoalToday}
								handlePressChangeGoalSchedule={handlePressChangeGoalSchedule}
								handlePressChangeGoal={handlePressChangeGoal}
							/>
						</Container>
					</View>

					<View style={{ width: '100%', height: '100%' }} key="current">
						<Container className="flex-1">
							<ActivityPageMainContent
								handlePressChangeGoalToday={handlePressChangeGoalToday}
								handlePressChangeGoalSchedule={handlePressChangeGoalSchedule}
								handlePressChangeGoal={handlePressChangeGoal}
							/>
						</Container>
					</View>

					<View style={{ width: '100%', height: '100%' }} key="next">
						<Container className="flex-1">
							<ActivityPageMainContent
								handlePressChangeGoalToday={handlePressChangeGoalToday}
								handlePressChangeGoalSchedule={handlePressChangeGoalSchedule}
								handlePressChangeGoal={handlePressChangeGoal}
							/>
						</Container>
					</View>
				</PagerView>
			</BlurProvider>
		</Page>
	)
}

export default Kcal
