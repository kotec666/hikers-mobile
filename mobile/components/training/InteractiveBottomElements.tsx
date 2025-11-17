import React from 'react'
import { View } from 'react-native'
import { cn } from '@/helpers/cn'
import ActionButton from '@/components/training/ActionButton'
import PlaySvg from '@/components/svg/PlaySvg'
import PauseSvg from '@/components/svg/PauseSvg'
import PeopleListSvg from '@/components/svg/PeopleListSvg'
import SwitchMapMode from '@/components/svg/SwitchMapMode'
import { Button } from '@/components/ui/Button'

interface IProps {
	isPaused: boolean
	peopleListHidden: boolean
	mapViewHidden: boolean
	handleClickPause: () => void
	handleClickPeopleList: () => void
	handleClickSwitchViewMode: () => void
	handleClickOpenEndModal: () => void
}

const InteractiveBottomElements = (props: IProps) => {
	return (
		<View
			className={cn('justify-end gap-[10px]', {
				'flex-row items-center': props.isPaused
			})}
		>
			<View className="flex-row gap-[10px]">
				<ActionButton onClickAction={props.handleClickPause}>
					{props.isPaused ? <PlaySvg /> : <PauseSvg />}
				</ActionButton>
				<ActionButton onClickAction={props.handleClickPeopleList} isPressed={!props.peopleListHidden}>
					<PeopleListSvg color={props.peopleListHidden ? '#000' : '#fff'} />
				</ActionButton>
				<ActionButton onClickAction={props.handleClickSwitchViewMode} isPressed={!props.mapViewHidden}>
					<SwitchMapMode color={props.mapViewHidden ? '#000' : '#fff'} />
				</ActionButton>
			</View>
			{props.isPaused && (
				<Button
					onPress={props.handleClickOpenEndModal}
					variant="white"
					buttonContainerClassName="flex-1"
					buttonHeight={70}
				>
					Завершить
				</Button>
			)}
		</View>
	)
}

export default InteractiveBottomElements
