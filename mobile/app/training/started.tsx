import { StyleSheet, View, Text, SafeAreaView, Dimensions, ScrollView } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import MapComponent from '@/components/map/MapComponent'
import { Container } from '@/components/ui/Container'
import { fontFamily } from '@/constants/Fonts'
import Parameter from '@/components/training/Parameter'
import ActionButton from '@/components/training/ActionButton'
import PauseSvg from '@/components/svg/PauseSvg'
import PeopleListSvg from '@/components/svg/PeopleListSvg'
import SwitchMapMode from '@/components/svg/SwitchMapMode'
import React, { useState } from 'react'
import PlaySvg from '@/components/svg/PlaySvg'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { Colors } from '@/constants/Colors'
import { cn } from '@/helpers/cn'
import EyeSvg from '@/components/svg/EyeSvg'
import { Button } from '@/components/ui/Button'
import EndTrainingModal from '@/components/training/EndTrainingModal'

const { height } = Dimensions.get('screen')

export default function TrainingStarted() {
	const insets = useSafeAreaInsets()
	const maxMapHeight = height / 2 - 40 - insets.top

	const [state, setState] = useState<{
		paused: boolean
		peopleListHidden: boolean
		mapViewHidden: boolean
		isEndTrainingModalOpen: boolean
	}>({
		paused: false,
		peopleListHidden: true,
		mapViewHidden: true,
		isEndTrainingModalOpen: false
	})

	const handleClickPause = () => {
		setState((s) => ({ ...s, paused: !s.paused }))
	}

	const handleClickPeopleList = () => {
		setState((s) => ({ ...s, peopleListHidden: !s.peopleListHidden, mapViewHidden: true }))
	}

	const handleClickSwitchViewMode = () => {
		setState((s) => ({ ...s, mapViewHidden: !s.mapViewHidden, peopleListHidden: true }))
	}

	const handleClickEnd = () => {
		setState((s) => ({ ...s, isEndTrainingModalOpen: !s.isEndTrainingModalOpen }))
	}

	const data = [
		{ id: 1, name: 'Стив Джобс first', avatar: true, icon: <EyeSvg color={Colors['green-main']} opened={true} /> },
		{ id: 2, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['blue-00']} opened={false} /> },
		{ id: 3, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['orange-main']} opened={false} /> },
		{ id: 4, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['gray-d9']} opened={true} /> },
		{ id: 5, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['gray-d9']} opened={true} /> },
		{ id: 6, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['gray-d9']} opened={true} /> },
		{ id: 7, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['gray-d9']} opened={true} /> },
		{ id: 8, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['gray-d9']} opened={true} /> },
		{ id: 9, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['gray-d9']} opened={true} /> },
		{ id: 10, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['gray-d9']} opened={true} /> },
		{ id: 11, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['gray-d9']} opened={true} /> },
		{ id: 12, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['gray-d9']} opened={true} /> },
		{ id: 13, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['gray-d9']} opened={true} /> },
		{ id: 14, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['gray-d9']} opened={true} /> },
		{ id: 15, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['gray-d9']} opened={true} /> },
		{ id: 16, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['gray-d9']} opened={true} /> },
		{ id: 17, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['gray-d9']} opened={true} /> },
		{ id: 18, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['gray-d9']} opened={true} /> },
		{ id: 19, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['gray-d9']} opened={true} /> },
		{ id: 20, name: 'Джефф Безос last', avatar: false, icon: <EyeSvg color={Colors['gray-d9']} opened={true} /> }
	]

	const metrics = [
		{ id: 1, label: 'Время', value: '00:12:34' },
		{ id: 2, label: 'Скорость', value: '12км/ч' },
		{ id: 3, label: 'Дистанция', value: '1200 м' },
		{ id: 4, label: 'Ккал', value: '51 ккал' },
		{ id: 5, label: 'Ср. темп', value: '05’24”' },
		{ id: 5, label: 'Набор высоты', value: '140 м' }
	]

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<SafeAreaView style={styles.container}>
				<EndTrainingModal open={state.isEndTrainingModalOpen} handleClose={handleClickEnd} />
				<Container>
					<Text className="my-[20px] text-white text-[20px]" style={{ fontFamily: fontFamily.bold }}>
						Тренировка
					</Text>
				</Container>
				{state.mapViewHidden && <MapComponent maxMapHeight={maxMapHeight} />}
				<Container style={{ paddingBottom: insets.bottom + 35 }} className="flex-1 w-full pt-[16px]">
					<View className="flex-1 justify-between gap-[16px]">
						{state.peopleListHidden ? (
							<View className="gap-4">
								<Parameter isPaused={state.paused} label={metrics[0].label} value={metrics[0].value} />
								<View
									className={cn('', {
										'flex-row justify-between': state.mapViewHidden,
										'gap-4': !state.mapViewHidden
									})}
								>
									{state.mapViewHidden
										? metrics
												.slice(1, 4)
												.map((metric) => (
													<Parameter
														key={`${metric.id}-cut-list`}
														isPaused={state.paused}
														label={metric.label}
														value={metric.value}
													/>
												))
										: metrics.map((metric) => (
												<Parameter
													key={`${metric.id}-full-list`}
													isPaused={state.paused}
													label={metric.label}
													value={metric.value}
												/>
											))}
								</View>
							</View>
						) : (
							state.mapViewHidden && (
								<ScrollView>
									<View className="gap-4">
										{data.map((item) => (
											<PeopleListItem key={item.id} {...item} />
										))}
									</View>
								</ScrollView>
							)
						)}
						<View
							className={cn('justify-end gap-[10px]', {
								'flex-row items-center': state.paused
							})}
						>
							<View className="flex-row gap-[10px]">
								<ActionButton onClickAction={handleClickPause}>
									{state.paused ? <PlaySvg /> : <PauseSvg />}
								</ActionButton>
								<ActionButton onClickAction={handleClickPeopleList} isPressed={!state.peopleListHidden}>
									<PeopleListSvg color={state.peopleListHidden ? '#000' : '#fff'} />
								</ActionButton>
								<ActionButton
									onClickAction={handleClickSwitchViewMode}
									isPressed={!state.mapViewHidden}
								>
									<SwitchMapMode color={state.mapViewHidden ? '#000' : '#fff'} />
								</ActionButton>
							</View>
							{state.paused && (
								<Button onPress={handleClickEnd} variant="white" buttonContainerClassName="flex-1">
									Завершить
								</Button>
							)}
						</View>
					</View>
				</Container>
			</SafeAreaView>
		</SafeAreaProvider>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: 'relative'
	}
})
