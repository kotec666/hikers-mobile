import { View, Text, Pressable } from 'react-native'
import { CalendarDay, CalendarMonth, RING_SIZE, ROW_HEIGHT, TEXT_ZONE_HEIGHT } from '@/helpers/calendar'
import { fontFamily } from '@/constants/Fonts'
import { isToday } from 'date-fns'
import { MonthRingsCanvas } from '@/components/activity-rings/MonthRingsCanvas'

interface MonthSectionProps {
	month: CalendarMonth
	containerWidth: number
	getProgress: (date: Date) => number
}

type GridCell = CalendarDay | null

export const MonthSection = ({ month, containerWidth, getProgress }: MonthSectionProps) => {
	const cellSize = containerWidth / 7

	// Собираем плоский массив ячеек: сначала пустые офсеты, потом реальные дни
	const cells: GridCell[] = [...Array.from({ length: month.startOffset }, () => null), ...month.days]

	// Разбиваем на строки по 7 — недели рендерим явно, без flexWrap
	const weeks: GridCell[][] = []
	for (let i = 0; i < cells.length; i += 7) {
		weeks.push(cells.slice(i, i + 7))
	}

	return (
		<View style={{ paddingTop: 12 }}>
			<Text className="text-white px-4 mb-5" style={{ fontSize: 22, fontFamily: fontFamily.bold }}>
				{month.title}
			</Text>

			<View style={{ position: 'relative', width: containerWidth }}>
				<MonthRingsCanvas
					month={month}
					containerWidth={containerWidth}
					rowHeight={ROW_HEIGHT}
					ringSize={RING_SIZE}
					ringTopOffset={TEXT_ZONE_HEIGHT}
					ringHorizontalOffset={0}
					getProgress={getProgress}
				/>

				<View>
					{weeks.map((week, rowIndex) => (
						<View key={`row-${rowIndex}`} style={{ flexDirection: 'row' }}>
							{week.map((day, colIndex) => {
								if (!day) {
									return (
										<View
											key={`empty-${rowIndex}-${colIndex}`}
											style={{ width: cellSize, height: ROW_HEIGHT }}
										/>
									)
								}

								const isCurrentDay = isToday(day.date)

								return (
									<Pressable
										key={day.date.toISOString()}
										onPress={() => console.log(day.date)}
										style={{ width: cellSize, height: ROW_HEIGHT, alignItems: 'center' }}
									>
										<View className="relative" style={{ height: TEXT_ZONE_HEIGHT }}>
											<Text
												className="text-white"
												style={{ fontSize: 13, fontFamily: fontFamily.medium }}
											>
												{day.dayNumber}
											</Text>
											{isCurrentDay && (
												<View className="absolute top-0 -right-[10px] w-[5.5px] h-[5.5px] rotate-45 bg-green-main rounded-[1px]" />
											)}
										</View>
									</Pressable>
								)
							})}
						</View>
					))}
				</View>
			</View>
		</View>
	)
}
