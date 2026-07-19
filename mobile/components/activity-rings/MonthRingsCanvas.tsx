import { Canvas, Group, Circle, Path, Skia } from '@shopify/react-native-skia'
import React, { useMemo } from 'react'
import { CalendarMonth } from '@/helpers/calendar'
import { Colors } from '@/constants/Colors'

interface Props {
	month: CalendarMonth
	containerWidth: number
	rowHeight: number
	ringSize: number
	ringTopOffset: number // отступ от верха строки до центра кольца (текст + margin)
	ringHorizontalOffset: number // новое: смещение центра кольца вправо
	getProgress: (date: Date) => number
	color?: string
}

const STROKE_RATIO = 0.1

export const MonthRingsCanvas = ({
	month,
	containerWidth,
	rowHeight,
	ringSize,
	ringTopOffset,
	ringHorizontalOffset,
	getProgress,
	color = Colors['green-main']
}: Props) => {
	const cellSize = containerWidth / 7
	const strokeWidth = ringSize * STROKE_RATIO
	const radius = (ringSize - strokeWidth) / 2

	// вся геометрия и arc-пути считаются один раз на месяц, а не на кадр
	const layout = useMemo(() => {
		return month.days.map((day, i) => {
			const indexInGrid = i + month.startOffset
			const col = indexInGrid % 7
			const row = Math.floor(indexInGrid / 7)

			const cx = col * cellSize + cellSize / 2 + ringHorizontalOffset
			const cy = row * rowHeight + ringTopOffset + ringSize / 2

			const progress = getProgress(day.date)
			const rect = Skia.XYWHRect(cx - radius, cy - radius, radius * 2, radius * 2)
			const arc = Skia.PathBuilder.Make()
				.addArc(rect, -90, (360 * Math.min(progress, 100)) / 100)
				.detach()

			return { key: day.date.toISOString(), cx, cy, arc }
		})
	}, [
		month.days,
		month.startOffset,
		cellSize,
		ringHorizontalOffset,
		rowHeight,
		ringTopOffset,
		ringSize,
		getProgress,
		radius
	])

	const totalRows = Math.ceil((month.startOffset + month.days.length) / 7)
	const height = totalRows * rowHeight

	return (
		<Canvas style={{ position: 'absolute', top: 0, left: 0, width: containerWidth, height }} pointerEvents="none">
			{layout.map(({ key, cx, cy, arc }) => (
				<Group key={key}>
					<Circle
						cx={cx}
						cy={cy}
						r={radius}
						style="stroke"
						strokeWidth={strokeWidth}
						color={Colors['gray-ff1a']}
					/>
					<Path path={arc} style="stroke" strokeWidth={strokeWidth} strokeCap="round" color={color} />
				</Group>
			))}
		</Canvas>
	)
}
