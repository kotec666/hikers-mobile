// import { Image, Text, VStack, HStack, Spacer } from '@expo/ui/swift-ui'
// import { font, foregroundStyle, padding, background, frame } from '@expo/ui/swift-ui/modifiers'
// import { createLiveActivity } from 'expo-widgets'
// import { TrainingType } from '@shared/enums'
//
// export type WorkoutActivityProps = {
// 	icon: 'figure.walk' | 'figure.run' | 'bicycle'
// 	typeLabel: string
// 	isPaused: boolean
// 	formattedDistance: string // уже содержит число + единицу (например, "1.07 миль")
// 	formattedTime: string
// 	formattedSpeed: string // уже содержит число + единицу (например, "7.5 миль/ч")
// }
//
// export const getActivityTypeIcon = (type: TrainingType) => {
// 	switch (type) {
// 		case TrainingType.WALK:
// 			return 'figure.walk'
// 		case TrainingType.RUN:
// 			return 'figure.run'
// 		case TrainingType.BICYCLE:
// 			return 'bicycle'
// 		default:
// 			return 'figure.walk'
// 	}
// }
//
// const WorkoutActivity = (props: WorkoutActivityProps) => {
// 	'widget'
// 	return {
// 		banner: (
// 			<VStack
// 				spacing={0}
// 				modifiers={[
// 					frame({
// 						minWidth: 0,
// 						maxWidth: Infinity
// 					})
// 				]}
// 			>
// 				<VStack
// 					alignment="center"
// 					spacing={0}
// 					modifiers={[
// 						padding({ vertical: 12 }),
// 						frame({
// 							minWidth: 0,
// 							maxWidth: Infinity
// 						}),
// 						...(props.isPaused ? [background('#ffc700')] : [])
// 					]}
// 				>
// 					<Text
// 						modifiers={[
// 							font({
// 								size: props.isPaused ? 16 : 18,
// 								weight: 'bold'
// 							}),
// 							foregroundStyle(props.isPaused ? '#000' : '#b8bab7')
// 						]}
// 					>
// 						{props.isPaused ? 'Остановлено' : 'Ходьба'}
// 					</Text>
// 				</VStack>
//
// 				<HStack spacing={0} alignment="bottom" modifiers={[padding({ vertical: 10, horizontal: 22 })]}>
// 					<VStack alignment="center" spacing={4}>
// 						<Text modifiers={[font({ size: 22, weight: 'bold' }), foregroundStyle('#fdfdfd')]}>00:07</Text>
// 						<Text modifiers={[font({ size: 12 }), foregroundStyle('#b2b3b7')]}>Время</Text>
// 					</VStack>
// 					<Spacer />
// 					<VStack alignment="center" spacing={4}>
// 						<Text modifiers={[font({ size: 32, weight: 'bold' }), foregroundStyle('#fdfdfd')]}>15.70</Text>
// 						<Text modifiers={[font({ size: 12 }), foregroundStyle('#b2b3b7')]}>Дистанция (км)</Text>
// 					</VStack>
// 					<Spacer />
// 					<VStack alignment="center" spacing={4}>
// 						<Text modifiers={[font({ size: 22, weight: 'bold' }), foregroundStyle('#fdfdfd')]}>7.5</Text>
// 						<VStack spacing={0} alignment="center">
// 							<Text modifiers={[font({ size: 12 }), foregroundStyle('#b2b3b7')]}>Скорость</Text>
// 							<Text modifiers={[font({ size: 12 }), foregroundStyle('#b2b3b7')]}>(км/ч)</Text>
// 						</VStack>
// 					</VStack>
// 				</HStack>
// 			</VStack>
// 		),
//
// 		compactLeading: <Image systemName={props.icon} size={14} />,
// 		compactTrailing: (
// 			<HStack spacing={2}>
// 				{props.isPaused && <Image systemName="pause.circle" size={14} color="#ffc700" />}{' '}
// 				<Text modifiers={[foregroundStyle('#fdfdfd')]}>{props.formattedTime}</Text>
// 			</HStack>
// 		),
// 		minimal: <Image systemName={props.icon} size={14} />,
//
// 		expandedLeading: (
// 			<VStack spacing={2} modifiers={[padding({ all: 8 })]}>
// 				<Image systemName={props.icon} size={18} />
// 				<Text modifiers={[font({ size: 12 }), foregroundStyle('#aaa')]}>{props.typeLabel}</Text>
// 			</VStack>
// 		),
//
// 		expandedTrailing: (
// 			<VStack spacing={2} modifiers={[padding({ bottom: 8, horizontal: 8 })]}>
// 				<Text modifiers={[font({ size: 24, weight: 'bold' }), foregroundStyle('#fdfdfd')]}>
// 					{props.formattedTime}
// 				</Text>
// 				{props.isPaused && (
// 					<Text modifiers={[font({ size: 12, weight: 'bold' }), foregroundStyle('#ffc700')]}>Пауза</Text>
// 				)}
// 			</VStack>
// 		),
//
// 		expandedBottom: (
// 			<HStack spacing={0} alignment="bottom" modifiers={[padding({ vertical: 10, horizontal: 22 })]}>
// 				<VStack alignment="center" spacing={4}>
// 					<Text modifiers={[font({ size: 22, weight: 'bold' }), foregroundStyle('#fdfdfd')]}>00:07</Text>
// 					<Text modifiers={[font({ size: 12 }), foregroundStyle('#b2b3b7')]}>Время</Text>
// 				</VStack>
// 				<Spacer />
// 				<VStack alignment="center" spacing={4}>
// 					<Text modifiers={[font({ size: 22, weight: 'bold' }), foregroundStyle('#fdfdfd')]}>15.70</Text>
// 					<Text modifiers={[font({ size: 12 }), foregroundStyle('#b2b3b7')]}>Дистанция (км)</Text>
// 				</VStack>
// 				<Spacer />
// 				<VStack alignment="center" spacing={4}>
// 					<Text modifiers={[font({ size: 22, weight: 'bold' }), foregroundStyle('#fdfdfd')]}>7.5</Text>
// 					<VStack spacing={0} alignment="center">
// 						<Text modifiers={[font({ size: 12 }), foregroundStyle('#b2b3b7')]}>Скорость (км/ч)</Text>
// 					</VStack>
// 				</VStack>
// 			</HStack>
// 		)
// 	}
// }
//
// export default createLiveActivity('WorkoutActivity', WorkoutActivity)
