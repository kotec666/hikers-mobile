import { HeartSvg } from '@/components/svg'
import { TrainingType } from '@shared/enums'
import { WorkoutTypesMap } from '@/consts/workout-types'
import { formatRelativeDate } from '@/helpers/formatRelativeDate'
import { IGuestPost } from '@/api/posts'
import { formatDistance } from '@/helpers/formatDistance'
import { formatTimeFromSecondsCompact } from '@/helpers/formatTime'
import NotFoundPost from '@/app/posts/[slug]/components/not-found-post'
import UserAvatar from '@/app/posts/[slug]/components/user-avatar'
import { MapProvider } from '@/components/providers/map-provider'
import YandexMap from '@/components/ui/map/yandex-map'
import { MapFullscreenTrigger } from '@/components/ui/map/map-fullscreen'
import { PostImageGrid } from '@/app/posts/[slug]/components/post-image-grid'

interface WorkoutPostProps {
	post: IGuestPost | null
}

export function WorkoutPost({ post }: WorkoutPostProps) {
	if (!post) {
		return <NotFoundPost />
	}

	const renderIcon = (workoutType?: TrainingType) => {
		const found = workoutType ? WorkoutTypesMap[workoutType] : null
		if (!found) return null
		return <found.IconComponent className="text-black" size={15} />
	}

	const images = post?.fileNames ?? []

	const creatorMetrics = post?.training.participants.find(
		(participant) => participant.user.id === post?.userCreator.id
	)?.metrics

	const username = post?.userCreator.name || post?.userCreator.username
	const creatorPoints =
		post?.training?.participants?.find((participant) => participant?.user?.id === post?.userCreator?.id)?.route
			?.points || []

	return (
		<div className="bg-[#212121] rounded-2xl overflow-hidden mx-auto">
			<div className="p-4">
				<div className="flex items-center gap-3">
					<UserAvatar bordered iconSize={24} avatarFilename={post?.userCreator.avatarFilename} />
					<div>
						<div className="flex flex-col gap-2">
							<div className="flex flex-row items-center gap-2">
								<span className="text-white font-medium">{username}</span>
								{post?.userCreator.badge && (
									<span className="text-xl font-medium">{post?.userCreator.badge}</span>
								)}
							</div>
							<div className="flex items-center gap-2">
								<div className="flex items-center justify-center bg-white rounded-sm w-5 h-5">
									{renderIcon(post?.training.type)}
								</div>
								<span className="text-xs text-gray-300 font-normal">
									{formatRelativeDate(post?.createdAt)}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="px-4 pb-3">
				<h1 className="text-white text-lg font-medium mb-2">{post?.title}</h1>
				<p className="text-gray-300 text-sm wrap-anywhere">{post?.description}</p>
			</div>

			<div className="px-4 pb-4 grid grid-cols-3 gap-4">
				<div>
					<div className="text-gray-400 text-xs mb-1">Расстояние</div>
					<div className="text-green-main text-2xl font-semibold">
						{formatDistance(creatorMetrics?.distanceM || 0)}
					</div>
				</div>
				<div>
					<div className="text-gray-400 text-xs mb-1">Время</div>
					<div className="text-green-main text-2xl font-semibold">
						{formatTimeFromSecondsCompact(creatorMetrics?.timeSec)}
					</div>
				</div>
				<div>
					<div className="text-gray-400 text-xs mb-1">Набор высоты</div>
					<div className="text-green-main text-2xl font-semibold">{`${creatorMetrics?.altitudeGainM || '-'} м`}</div>
				</div>
			</div>

			<div className="px-4 pb-4 h-64 sm:h-80 lg:h-96 overflow-hidden">
				<div className="relative w-full h-full rounded-xl overflow-hidden">
					<MapProvider
						apiUrl={`https://api-maps.yandex.ru/v3/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY}&lang=ru_RU`}
					>
						<YandexMap className="rounded-xl" points={creatorPoints} routeColor={post?.userCreator.color} />
					</MapProvider>
					<MapFullscreenTrigger points={creatorPoints} routeColor={post?.userCreator.color} />
				</div>
			</div>

			<PostImageGrid fileNames={images} altPrefix="Тренировка" />

			<div className="px-4 pb-4 flex items-center gap-6">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<button className="text-gray-400 hover:text-white transition-colors">
							<HeartSvg className="text-white" />
						</button>
						<span className="text-white font-medium">{post?.likesCount}</span>
					</div>
				</div>
			</div>
		</div>
	)
}
