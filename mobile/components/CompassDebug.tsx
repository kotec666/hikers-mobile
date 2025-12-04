import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface CompassDebugProps {
	heading: number
	accuracy?: number | null
	altitude?: number | null
	altitudeAccuracy?: number | null
	position?: 'top-right' | 'bottom-left' | 'bottom-right'
}

const CompassDebug = ({ heading, accuracy, altitude, altitudeAccuracy, position = 'top-right' }: CompassDebugProps) => {
	const getPositionStyle = () => {
		switch (position) {
			case 'top-right':
				return { top: 50, right: 16 }
			case 'bottom-left':
				return { bottom: 100, left: 16 }
			case 'bottom-right':
				return { bottom: 100, right: 16 }
			default:
				return { top: 50, right: 16 }
		}
	}

	// Функция для вычисления направления по углу
	const getDirectionLabel = (deg: number): string => {
		const directions = [
			{ name: 'Север', range: [337.5, 360] },
			{ name: 'Север', range: [0, 22.5] },
			{ name: 'Северо-восток', range: [22.5, 67.5] },
			{ name: 'Восток', range: [67.5, 112.5] },
			{ name: 'Юго-восток', range: [112.5, 157.5] },
			{ name: 'Юг', range: [157.5, 202.5] },
			{ name: 'Юго-запад', range: [202.5, 247.5] },
			{ name: 'Запад', range: [247.5, 292.5] },
			{ name: 'Северо-запад', range: [292.5, 337.5] }
		]

		const match = directions.find((dir) => deg >= dir.range[0] && deg < dir.range[1])

		return match ? match.name : '—'
	}

	const directionLabel = getDirectionLabel(heading)

	return (
		<View style={[styles.container, getPositionStyle()]}>
			<Text style={styles.title}>Компас</Text>
			<View style={styles.compassCircle}>
				<View style={[styles.compassNeedle, { transform: [{ rotate: `${heading}deg` }] }]}>
					<View style={styles.compassArrow} />
				</View>
				<View style={styles.compassCenter} />
				<Text style={[styles.compassText, styles.northText]}>С</Text>
				<Text style={[styles.compassText, styles.eastText]}>В</Text>
				<Text style={[styles.compassText, styles.southText]}>Ю</Text>
				<Text style={[styles.compassText, styles.westText]}>З</Text>
				<View style={[styles.directionLine, styles.northLine]} />
				<View style={[styles.directionLine, styles.eastLine]} />
				<View style={[styles.directionLine, styles.southLine]} />
				<View style={[styles.directionLine, styles.westLine]} />
			</View>
			<Text style={styles.value}>Направление: {heading?.toFixed(1)}°</Text>
			{accuracy !== null && accuracy !== undefined && (
				<Text style={styles.value}>accuracy: {Math.round(accuracy)}</Text>
			)}
			{altitude !== null && altitude !== undefined && (
				<Text style={styles.value}>altitude: {Math.round(altitude)}</Text>
			)}
			{altitudeAccuracy !== null && altitudeAccuracy !== undefined && (
				<Text style={styles.value}>altitudeAccuracy: {Math.round(altitudeAccuracy)}</Text>
			)}
			<Text style={styles.helpText}>Красная стрелка → {directionLabel}</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		backgroundColor: 'rgba(0, 0, 0, 0.9)',
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
		zIndex: 1000,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.3)'
	},
	title: {
		color: 'white',
		fontSize: 14,
		fontWeight: 'bold',
		marginBottom: 8
	},
	compassCircle: {
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 2,
		borderColor: 'white',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 8,
		position: 'relative',
		backgroundColor: 'rgba(30, 30, 30, 0.7)'
	},
	compassNeedle: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center'
	},
	compassArrow: {
		width: 3,
		height: 35,
		backgroundColor: 'red',
		position: 'absolute',
		top: 5,
		borderRadius: 1.5,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3,
		elevation: 4
	},
	compassCenter: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: 'white',
		zIndex: 2
	},
	compassText: {
		position: 'absolute',
		color: 'white',
		fontSize: 14,
		fontWeight: 'bold',
		zIndex: 3,
		textShadowColor: 'rgba(0, 0, 0, 0.8)',
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2
	},
	northText: { top: 5 },
	eastText: { right: 5, top: '50%', transform: [{ translateY: -7 }] },
	southText: { bottom: 5 },
	westText: { left: 5, top: '50%', transform: [{ translateY: -7 }] },
	directionLine: {
		position: 'absolute',
		backgroundColor: 'rgba(255, 255, 255, 0.4)',
		zIndex: 1
	},
	northLine: { width: 2, height: 15, top: 0, left: '50%', transform: [{ translateX: -1 }] },
	eastLine: { width: 15, height: 2, right: 0, top: '50%', transform: [{ translateY: -1 }] },
	southLine: { width: 2, height: 15, bottom: 0, left: '50%', transform: [{ translateX: -1 }] },
	westLine: { width: 15, height: 2, left: 0, top: '50%', transform: [{ translateY: -1 }] },
	value: { color: 'white', fontSize: 11, marginBottom: 2 },
	helpText: {
		color: 'rgba(255, 255, 255, 0.7)',
		fontSize: 10,
		marginTop: 4,
		fontStyle: 'italic'
	}
})

export default CompassDebug
