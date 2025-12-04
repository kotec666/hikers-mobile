import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'

export const DebugItemCard = ({ item }: { item: IWorkoutLocationStorageItem }) => {
	const [expanded, setExpanded] = useState(false)

	const c = item.locationObject.coords
	const isPaused = item.isPausedPoint

	return (
		<View
			style={{
				marginVertical: 6,
				padding: 12,
				borderRadius: 12,
				backgroundColor: '#1E1E1F',
				borderWidth: 1,
				borderColor: isPaused ? '#666' : '#2ECC71',
				shadowColor: '#000',
				shadowOpacity: 0.25,
				shadowRadius: 4
			}}
		>
			{/* Header */}
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
				<Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
					{isPaused ? '⏸ Пауза' : '▶ Работа'}
				</Text>
				<Text style={s.title}>relTs: {item.relTs}</Text>
			</View>

			{/* Coordinates block */}
			<View style={{ marginBottom: 6 }}>
				<Text style={s.title}>Координаты</Text>
				<DebugRow label="lat" value={c.latitude} />
				<DebugRow label="lon" value={c.longitude} />
				<DebugRow label="altitude" value={c.altitude} />
				<DebugRow label="accuracy" value={c.accuracy} />
				<DebugRow label="heading" value={c.heading} />
				<DebugRow label="speed" value={c.speed} />
			</View>

			{/* Meta */}
			<View style={{ marginBottom: 6 }}>
				<Text style={s.title}>Meta</Text>
				<DebugRow label="timestamp" value={item.locationObject.timestamp} />
				<DebugRow label="mocked" value={item.locationObject.mocked ? 'true' : 'false'} />
			</View>

			{/* Flags */}
			<View style={{ marginBottom: 6 }}>
				<Text style={s.title}>Флаги</Text>
				<DebugRow label="isPausedPoint" value={item.isPausedPoint ? 'true' : 'false'} />
				<DebugRow label="isSavedToServer" value={item.isSavedToServer ? 'true' : 'false'} />
			</View>

			{/* Expand Raw JSON */}
			<TouchableOpacity onPress={() => setExpanded((v) => !v)}>
				<Text style={{ color: '#2ECC71', marginTop: 4 }}>{expanded ? 'Скрыть JSON ▲' : 'Показать JSON ▼'}</Text>
			</TouchableOpacity>

			{expanded && (
				<Text
					style={{
						marginTop: 8,
						color: '#ccc',
						fontSize: 12,
						fontFamily: 'monospace'
					}}
				>
					{JSON.stringify(item, null, 2)}
				</Text>
			)}
		</View>
	)
}

const DebugRow = ({ label, value }: { label: string; value: any }) => (
	<View style={{ flexDirection: 'row', marginBottom: 2 }}>
		<Text style={{ width: 110, color: '#aaa', fontSize: 13 }}>{label}:</Text>
		<Text style={{ color: 'white', fontSize: 13 }}>{String(value)}</Text>
	</View>
)

const s = StyleSheet.create({
	title: {
		color: '#2ECC71',
		fontSize: 14,
		fontWeight: '600',
		marginBottom: 2
	}
})
