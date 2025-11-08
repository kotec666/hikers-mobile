import React, { useState } from 'react'
import EndTrainingModal from '@/components/training/EndTrainingModal'
import { Container } from '@/components/ui/Container'
import { Dimensions, ScrollView, Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import MapComponent, { ILatLng } from '@/components/map/MapComponent'
import Parameter from '@/components/training/Parameter'
import { cn } from '@/helpers/cn'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import ActionButton from '@/components/training/ActionButton'
import PlaySvg from '@/components/svg/PlaySvg'
import PauseSvg from '@/components/svg/PauseSvg'
import PeopleListSvg from '@/components/svg/PeopleListSvg'
import SwitchMapMode from '@/components/svg/SwitchMapMode'
import { Button } from '@/components/ui/Button'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import EyeSvg from '@/components/svg/EyeSvg'
import { Colors } from '@/constants/Colors'
import PeopleRemoveSvg from '@/components/svg/PeopleRemoveSvg'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'

interface IProps {
	userLocations: IWorkoutLocationStorageItem[]
	isPaused: boolean
	handleClickPause: () => void
	accuracy: number | null
	heading?: number
	markerPosition?: ILatLng | null
	mapCenter?: ILatLng
}

const { height } = Dimensions.get('screen')

const data = [
	{
		id: '1',
		username: 'kotec',
		name: 'Стив Джобс first',
		avatar: null,
		icon: <EyeSvg color={Colors['green-main']} opened={true} />
	},
	{
		id: '2',
		username: 'kotec',
		name: 'Джефф Безос',
		avatar: null,
		icon: <EyeSvg color={Colors['blue-00']} opened={false} />
	},
	{
		id: '3',
		username: 'kotec',
		name: 'Джефф Безос',
		avatar: null,
		icon: <EyeSvg color={Colors['orange-main']} opened={false} />
	},
	{
		id: '4',
		username: 'kotec',
		name: 'Джефф Безос',
		avatar: null,
		icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
	},
	{
		id: '5',
		username: 'kotec',
		name: 'Джефф Безос',
		avatar: null,
		icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
	},
	{
		id: '6',
		username: 'kotec',
		name: 'Джефф Безос',
		avatar: null,
		icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
	},
	{
		id: '7',
		username: 'kotec',
		name: 'Джефф Безос',
		avatar: null,
		icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
	},
	{
		id: '8',
		username: 'kotec',
		name: 'Джефф Безос',
		avatar: null,
		icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
	},
	{
		id: '9',
		username: 'kotec',
		name: 'Джефф Безос',
		avatar: null,
		icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
	},
	{
		id: '10',
		username: 'kotec',
		name: 'Джефф Безос',
		avatar: null,
		icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
	},
	{
		id: '11',
		username: 'kotec',
		name: 'Джефф Безос',
		avatar: null,
		icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
	},
	{
		id: '12',
		username: 'kotec',
		name: 'Джефф Безос',
		avatar: null,
		icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
	},
	{
		id: '13',
		username: 'kotec',
		name: 'Джефф Безос',
		avatar: null,
		icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
	},
	{
		id: '14',
		username: 'kotec',
		name: 'Джефф Безос',
		avatar: null,
		icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
	},
	{
		id: '15',
		username: 'kotec',
		name: 'Джефф Безос',
		avatar: null,
		icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
	},
	{
		id: '16',
		username: 'kotec',
		name: 'Джефф Безос',
		avatar: null,
		icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
	},
	{
		id: '17',
		username: 'kotec',
		name: 'Джефф Безос',
		avatar: null,
		icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
	},
	{
		id: '18',
		username: 'kotec',
		name: 'Джефф Безос',
		avatar: null,
		icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
	},
	{
		id: '19',
		username: 'kotec',
		name: 'Джефф Безос',
		avatar: null,
		icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
	},
	{
		id: '20',
		username: 'kotec',
		name: 'Джефф Безос last',
		avatar: null,
		icon: <EyeSvg color={Colors['gray-d9']} opened={true} />
	}
]

const metrics = [
	{ id: 1, label: 'Время', value: '00:12:34' },
	{ id: 2, label: 'Скорость', value: '12км/ч' },
	{ id: 3, label: 'Дистанция', value: '1200 м' },
	{ id: 4, label: 'Ккал', value: '51 ккал' },
	{ id: 5, label: 'Ср. темп', value: '05’24”' },
	{ id: 6, label: 'Набор высоты', value: '140 м' }
]

const WorkoutStarted = (props: IProps) => {
	const insets = useSafeAreaInsets()
	const maxMapHeight = height / 2 - 40 - insets.top
	const [state, setState] = useState<{
		isEndTrainingModalOpen: boolean
		peopleListHidden: boolean
		mapViewHidden: boolean
	}>({
		peopleListHidden: true,
		mapViewHidden: true,
		isEndTrainingModalOpen: false
	})

	const handleClickEnd = () => {
		setState((s) => ({ ...s, isEndTrainingModalOpen: !s.isEndTrainingModalOpen }))
	}

	const handleClickPeopleList = () => {
		setState((s) => ({ ...s, peopleListHidden: !s.peopleListHidden, mapViewHidden: true }))
	}

	const handleClickSwitchViewMode = () => {
		setState((s) => ({ ...s, mapViewHidden: !s.mapViewHidden, peopleListHidden: true }))
	}

	return (
		<>
			<EndTrainingModal open={state.isEndTrainingModalOpen} handleClose={handleClickEnd} />
			{/*<CompassDebug heading={props.heading || 0} position="bottom-right" accuracy={props.accuracy} />*/}
			<Container>
				<Text className="my-[20px] text-white text-[20px]" style={{ fontFamily: fontFamily.bold }}>
					Тренировка
				</Text>
			</Container>
			{state.mapViewHidden && (
				<MapComponent
					heading={props.heading}
					accuracy={props.accuracy}
					markerPosition={props.markerPosition}
					maxMapHeight={maxMapHeight}
					mapCenter={props.mapCenter}
					userLocations={props.userLocations}
				/>
			)}
			<Container style={{ paddingBottom: insets.bottom + 35 }} className="flex-1 w-full pt-[16px]">
				<View className="flex-1 justify-between gap-[16px]">
					{state.peopleListHidden ? (
						<View className="gap-4">
							<Parameter isPaused={props.isPaused} label={metrics[0].label} value={metrics[0].value} />
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
													isPaused={props.isPaused}
													label={metric.label}
													value={metric.value}
												/>
											))
									: metrics.map((metric) => (
											<Parameter
												key={`${metric.id}-full-list`}
												isPaused={props.isPaused}
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
										<PeopleListItem
											key={item.id}
											id={item.id}
											avatar={item.avatar}
											name={item.name}
											username={item.username}
											icon={{
												iconSvg: <EyeSvg color={Colors['blue-00']} opened={false} />,
												iconCb: () => {}
											}}
										/>
									))}
								</View>
							</ScrollView>
						)
					)}
					<View
						className={cn('justify-end gap-[10px]', {
							'flex-row items-center': props.isPaused
						})}
					>
						<View className="flex-row gap-[10px]">
							<ActionButton onClickAction={props.handleClickPause}>
								{props.isPaused ? <PlaySvg /> : <PauseSvg />}
							</ActionButton>
							<ActionButton onClickAction={handleClickPeopleList} isPressed={!state.peopleListHidden}>
								<PeopleListSvg color={state.peopleListHidden ? '#000' : '#fff'} />
							</ActionButton>
							<ActionButton onClickAction={handleClickSwitchViewMode} isPressed={!state.mapViewHidden}>
								<SwitchMapMode color={state.mapViewHidden ? '#000' : '#fff'} />
							</ActionButton>
						</View>
						{props.isPaused && (
							<Button
								onPress={handleClickEnd}
								variant="white"
								buttonContainerClassName="flex-1"
								buttonHeight={70}
							>
								Завершить
							</Button>
						)}
					</View>
				</View>
			</Container>
		</>
	)
}

export default WorkoutStarted
