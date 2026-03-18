import React from 'react'
import { WorkoutPost } from '@/app/posts/[slug]/components/WorkoutPost'
import { BackgroundPattern } from '@/app/posts/[slug]/components/BackgroundPattern'
import { getPostByIdCached, IPost } from '@/api/posts'
import { Metadata } from 'next'
import { generateBasicMetadata } from '@/helpers/generateBasicMetadata'
import { WorkoutTypesMap } from '@/consts/workout-types'
import { PATH_TO_IMAGE } from '@/consts/PATH_TO_FILES'
import { Routes } from '@/consts/routes'
import { SharePageHeader } from '@/app/posts/[slug]/components/SharePageHeader'
import RedirectScheme from '@/app/posts/[slug]/components/RedirectScheme'
import { env } from '@/consts/env'

interface PostProps {
	params: { slug: string }
}

const token =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgwMGRiYmI2LTBmMTUtNGE5OS1hOGQ3LTIxZTFmNTMyYjY5YiIsImhzIjoiOTBmYWMwNmM0OWMyZDI4OWMyYzNhZWY4ZjM2NmQ2NmNlOTRmMDBkZWYzMGQ4MDM4NTVmZThlM2Q4MjBhZDBiZiIsImlhdCI6MTc3Mzg0MDM2NiwiZXhwIjoxNzczODQyMTY2fQ.3w6_oFAQfG6y4kmwg4dQPmvFRMdVc6YbZalot02KJas'

export async function generateMetadata({ params }: PostProps): Promise<Metadata> {
	const { slug } = await params
	let postData: null | IPost = null
	try {
		postData = await getPostByIdCached(slug, token)
	} catch (e) {
		console.log(e)
	}

	const defaultImage = `${env.web_url}/opengraph-image.png`

	if (!postData) {
		return generateBasicMetadata({
			title: 'Хайкерс',
			keywords: 'хайкерс, тренировка',
			description: '',
			openGraph: {
				width: 500,
				height: 500,
				image_url: defaultImage
			},
			alternates: { canonical: Routes.POSTS }
		})
	}

	return generateBasicMetadata({
		title: `Хайкерс: ${postData.title}`,
		keywords: `${postData.title}, ${WorkoutTypesMap[postData.training.type].name}, хайкерс, hikers, тренировка`,
		description: postData.description || '',
		openGraph: {
			width: 500,
			height: 500,
			url: `${Routes.POSTS}/${postData.id}`,
			image_url: `${postData.fileNames.length ? `${PATH_TO_IMAGE}${postData.fileNames[0]}` : defaultImage}`
		},
		twitter: {
			card: 'app',
			app: {
				url: {
					iphone: `hikers://posts/${postData.id}`,
					ipad: `hikers://posts/${postData.id}`,
					googleplay: `https://hikers.run/posts/${postData.id}`
				}
			}
		},
		alternates: {
			canonical: `${Routes.POSTS}/${postData.id}`
		},
		itunes: {
			appArgument: `hikers://posts/${postData.id}`
		},
		other: {
			'al:ios:url': `hikers://posts/${postData.id}`,
			'al:android:url': `hikers://posts/${postData.id}`,
			'apple-itunes-app': `app-id=999999999, app-argument=hikers://posts/${postData.id}`
		}
	})
}

const Post = async ({ params }: PostProps) => {
	const { slug } = await params
	let postData: null | IPost = null

	try {
		postData = await getPostByIdCached(slug, token)
	} catch (e) {
		console.log(e)
	}

	return (
		<div className="min-h-screen bg-[#0d0d0d] relative">
			<RedirectScheme scheme="hikers://posts/" postId={postData?.id} />
			<BackgroundPattern />
			<SharePageHeader />

			<main className="max-w-7xl mx-auto px-4 pt-6 relative z-10">
				<WorkoutPost post={postData} />
			</main>

			<p className="text-center text-gray-500 py-6 text-sm relative z-10">
				Загрузи приложение, чтобы делиться своими тренировками
			</p>
		</div>
	)
}

export default Post
