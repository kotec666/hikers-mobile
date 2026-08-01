import React from 'react'
import { Dimensions, FlatList, View } from 'react-native'
import { Skeleton, SkeletonCircle, SkeletonText } from './Skeleton'

const { height: SCREEN_HEIGHT } = Dimensions.get('screen')
const SLIDE_ASPECT_RATIO = SCREEN_HEIGHT / 3.83
const SLIDE_ASPECT_RATIO_DETAILS = SCREEN_HEIGHT / 3.6

/** Заголовок профиля: аватар + имя + ник + карточки статистики */
export function ProfileHeaderSkeleton({ isMyProfile }: { isMyProfile?: boolean }) {
	return (
		<View
			style={{
				gap: 20
			}}
		>
			<View
				style={{
					gap: 8
				}}
			>
				<View
					style={{
						gap: 16
					}}
				>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between'
						}}
					>
						{/* аватар */}
						<SkeletonCircle size={117} />
						{/* подробнее */}
						{isMyProfile && <SkeletonCircle size={50} />}
					</View>
					{/* имя */}
					<Skeleton width="50%" height={19} borderRadius={4} />
				</View>
				{/* ник */}
				<Skeleton width="30%" height={16} borderRadius={4} delay={80} />
			</View>
			{/* соц. статистика */}
			<ActivityListSkeleton height={81} />
			{/* кнопка */}
			{isMyProfile ? (
				<Skeleton height={50} borderRadius={25} />
			) : (
				<View
					style={{
						flexDirection: 'row',
						gap: 10
					}}
				>
					<Skeleton width="48.8%" height={50} borderRadius={25} />
					<Skeleton width="48.8%" height={50} borderRadius={25} />
				</View>
			)}
			{/* Достижения заголовок */}
			<Skeleton width="40%" height={16} borderRadius={8} />
			{/* Достижения - список */}
			<ActivityListSkeleton height={74} delay={50} />
			{/* Активности заголовок */}
			<Skeleton width="40%" height={16} borderRadius={8} />
			{/* Активности - список */}
			<ActivityListSkeleton height={68} delay={60} />
			{/* Дневная активность */}
			<Skeleton height={181} borderRadius={16} delay={70} />
		</View>
	)
}

/** Пост (элемент списка) */
export function PostListItemSkeleton({ isMyPost }: { isMyPost?: boolean }) {
	return (
		<View
			style={{
				gap: 15
			}}
		>
			<View
				style={{
					flexDirection: 'row',
					gap: 16
				}}
			>
				<View
					style={{
						flex: 1,
						flexDirection: 'row'
					}}
				>
					<View
						style={{
							flexDirection: 'row',
							gap: 16,
							flex: 1
						}}
					>
						{/* аватар */}
						<SkeletonCircle size={50} />
						<View
							style={{
								flex: 1,
								gap: 5
							}}
						>
							{/* имя */}
							<Skeleton width={isMyPost ? '50%' : '100%'} height={17} borderRadius={4} />
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									gap: 8
								}}
							>
								{/* тип тренировки */}
								<Skeleton width={25} height={25} borderRadius={8} />
								{/* когда создано */}
								<Skeleton width={isMyPost ? '30%' : '60%'} height={13} borderRadius={2} />
							</View>
						</View>
					</View>
					{!isMyPost && (
						<View
							style={{
								flex: 1,
								flexDirection: 'row',
								justifyContent: 'flex-end',
								alignItems: 'center',
								gap: 20
							}}
						>
							{/* подписаться */}
							<Skeleton width="50%" height={24} borderRadius={2} />
							{/* подробнее */}
							<Skeleton width={20} height={20} borderRadius={2} />
						</View>
					)}
				</View>
			</View>
			<View
				style={{
					gap: 6
				}}
			>
				{/* заголовок */}
				<Skeleton width="30%" height={19} borderRadius={4} />
				{/* описание */}
				<SkeletonText lines={4} lineHeight={16} gap={6} borderRadius={4} />
			</View>
			{/* метрики */}
			<ActivityListSkeleton height={51} />
			{/* картинка / карта */}
			<Skeleton height={SLIDE_ASPECT_RATIO} borderRadius={25} />
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between'
				}}
			>
				{/* участники */}
				<Skeleton width="50%" height={35} />
				<View
					style={{
						flexDirection: 'row',
						gap: 15
					}}
				>
					{/* лайк */}
					<Skeleton width={40} height={35} borderRadius={8} />
					{/* поделиться */}
					<Skeleton width={40} height={35} borderRadius={8} />
				</View>
			</View>
		</View>
	)
}

/** Пост (подробнее) */
export function PostItemSkeleton() {
	return (
		<View
			style={{
				gap: 15
			}}
		>
			<View
				style={{
					flexDirection: 'row',
					gap: 16
				}}
			>
				{/* аватар */}
				<SkeletonCircle size={50} />
				<View
					style={{
						flex: 1,
						gap: 5
					}}
				>
					{/* имя */}
					<Skeleton width="40%" height={17} borderRadius={4} />
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							gap: 8
						}}
					>
						{/* тип тренировки */}
						<Skeleton width={25} height={25} borderRadius={8} />
						{/* когда создано */}
						<Skeleton width="30%" height={13} borderRadius={2} />
					</View>
				</View>
			</View>
			<View
				style={{
					gap: 6
				}}
			>
				{/* заголовок */}
				<Skeleton width="30%" height={19} borderRadius={4} />
				{/* описание */}
				<SkeletonText lines={4} lineHeight={16} gap={6} borderRadius={4} />
			</View>
			{/* метрики */}
			<ActivityListSkeleton height={51} />
			{/* карта */}
			<Skeleton height={SLIDE_ASPECT_RATIO_DETAILS} borderRadius={25} />
			{/* картинки */}
			<Skeleton height={SLIDE_ASPECT_RATIO} borderRadius={25} delay={50} />
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between'
				}}
			>
				{/* участники */}
				<Skeleton width="50%" height={35} />
				<View
					style={{
						flexDirection: 'row',
						gap: 15
					}}
				>
					{/* лайк + поделиться */}
					<Skeleton width={40} height={35} borderRadius={8} />
					<Skeleton width={40} height={35} borderRadius={8} />
				</View>
			</View>
		</View>
	)
}

/** Пользователь (элемент списка) */
export function UserListItemSkeleton({ actionsCount = 1 }: { actionsCount?: number }) {
	return (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center'
			}}
		>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					gap: 15
				}}
			>
				{/* аватар */}
				<SkeletonCircle size={50} />
				{/* имя */}
				<Skeleton width="60%" height={17} borderRadius={4} />
			</View>
			{/* иконка взаимодействия */}
			<View
				style={{
					flexDirection: 'row',
					gap: 12
				}}
			>
				{Array.from({ length: actionsCount }).map((_, index) => (
					<Skeleton key={index} width={25} height={25} borderRadius={4} />
				))}
			</View>
		</View>
	)
}

export function UserListSkeleton({ count = 6, actionsCount }: { count?: number; actionsCount?: number }) {
	return (
		<View style={{ gap: 15 }}>
			{Array.from({ length: count }).map((_, i) => (
				<UserListItemSkeleton key={i} actionsCount={actionsCount} />
			))}
		</View>
	)
}

/** Карточка */
export function ActivitySkeleton({
	isEdit = false,
	height = 70,
	delay = 80
}: {
	isEdit?: boolean
	height?: number
	delay?: number
}) {
	return (
		<View style={{ flex: 1 }}>
			<Skeleton width="100%" height={height} borderRadius={15} delay={delay} />
			{isEdit && (
				<View
					style={{
						position: 'absolute',
						alignItems: 'center',
						justifyContent: 'center',
						bottom: -5,
						right: -5
					}}
				>
					<Skeleton width={25} height={25} borderRadius={12.5} />
				</View>
			)}
		</View>
	)
}

export function ActivityListSkeleton({
	isEdit = false,
	count = 3,
	columns = 3,
	height = 70,
	delay = 80
}: {
	isEdit?: boolean
	count?: number
	columns?: number
	height?: number
	delay?: number
}) {
	const skeletonData = Array.from({ length: count })
	return (
		<FlatList
			scrollEnabled={false}
			nestedScrollEnabled={true}
			removeClippedSubviews={false}
			initialNumToRender={count}
			windowSize={count}
			data={skeletonData}
			numColumns={columns}
			renderItem={() => <ActivitySkeleton delay={delay} height={height} isEdit={isEdit} />}
			contentContainerStyle={{ paddingHorizontal: 5 }}
			columnWrapperStyle={{ gap: 15, marginBottom: 15 }}
		/>
	)
}

export function AchievementsListSkeleton({ count = 11 }: { count?: number }) {
	return (
		<View style={{ gap: 15 }}>
			<Skeleton width="40%" height={16} borderRadius={4} />
			{Array.from({ length: count }).map((_, i) => (
				<Skeleton key={i} height={55} borderRadius={20} />
			))}
		</View>
	)
}

export function NotificationsListSkeleton({ count = 11 }: { count?: number }) {
	return (
		<View style={{ gap: 15 }}>
			{Array.from({ length: count }).map((_, i) => (
				<View
					key={i}
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						gap: 16
					}}
				>
					<SkeletonCircle size={50} />
					<Skeleton width="83%" height={65} borderRadius={8} />
				</View>
			))}
		</View>
	)
}

export function WorkoutHistoryListSkeleton({ count = 11 }: { count?: number }) {
	return (
		<View style={{ gap: 15 }}>
			<View
				style={{
					marginVertical: 15
				}}
			>
				<Skeleton width="30%" height={16} borderRadius={4} />
			</View>
			{Array.from({ length: count }).map((_, i) => (
				<View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
					<Skeleton width={50} height={50} borderRadius={15} />
					<Skeleton width="40%" height={16} borderRadius={4} />
				</View>
			))}
		</View>
	)
}
