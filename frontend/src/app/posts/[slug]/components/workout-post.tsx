import { HeartSvg } from '@/components/svg'
import { TrainingType } from '@shared/enums'
import { WorkoutTypesMap } from '@/consts/workout-types'
import Image from 'next/image'
import { formatRelativeDate } from '@/helpers/formatRelativeDate'
import { IGuestPost } from '@/api/posts'
import { formatDistance } from '@/helpers/formatDistance'
import { formatTimeFromSecondsCompact } from '@/helpers/formatTime'
import { PATH_TO_IMAGE } from '@/consts/PATH_TO_FILES'
import NotFoundPost from '@/app/posts/[slug]/components/not-found-post'
import UserAvatar from '@/app/posts/[slug]/components/user-avatar'
import { MapProvider } from '@/components/providers/map-provider'
import YandexMap from '@/components/ui/map/yandex-map'
import { cn } from '@/lib/utils'

type LayoutItem = {
	className: string
	showOverlay?: boolean
	overlayText?: string
}

const getLayout = (count: number): LayoutItem[] => {
	if (count === 1) {
		return [{ className: 'col-span-2 row-span-2 h-96' }]
	}

	if (count === 2) {
		return [{ className: 'h-64' }, { className: 'h-64' }]
	}

	if (count === 3) {
		return [{ className: 'col-span-2 row-span-2 h-96' }, { className: 'h-48' }, { className: 'h-48' }]
	}

	if (count === 4) {
		return new Array(4).fill({ className: 'h-48' })
	}

	// 5+
	return [
		{ className: 'col-span-2 row-span-2 h-96' },
		{ className: 'h-48' },
		{ className: 'h-48' },
		{ className: 'h-48' },
		{
			className: 'h-48',
			showOverlay: true,
			overlayText: `+${count - 5}`
		}
	]
}

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
	const count = images.length
	const layout = getLayout(count)

	const getGridClass = (count: number) => {
		if (count === 1) return 'grid-cols-1'
		return 'grid-cols-2'
	}

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
							<span className="text-white font-medium">{username}</span>
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

			<div className="px-4 pb-4 h-64 overflow-hidden">
				<MapProvider
					apiUrl={`https://api-maps.yandex.ru/v3/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY}&lang=ru_RU`}
				>
					<YandexMap className="rounded-xl" points={creatorPoints} />
				</MapProvider>
			</div>

			{count > 0 && (
				<div className={cn('px-4 pb-4 grid gap-2', getGridClass(count))}>
					{layout.map((item, idx) => {
						const img = images[idx]

						return (
							<div key={idx} className={cn('relative overflow-hidden rounded-xl', item.className)}>
								<Image
									src={`${PATH_TO_IMAGE}${img}`}
									alt={`Тренировка ${idx + 1}`}
									fill
									className="object-cover"
								/>

								{item.showOverlay && (
									<div className="absolute inset-0 bg-black/60 flex items-center justify-center">
										<span className="text-white text-xl font-semibold">{item.overlayText}</span>
									</div>
								)}
							</div>
						)
					})}
				</div>
			)}

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
