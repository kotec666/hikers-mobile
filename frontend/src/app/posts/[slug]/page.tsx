import React from 'react'
import { WorkoutPost } from '@/app/posts/[slug]/components/WorkoutPost'
import { BackgroundPattern } from '@/app/posts/[slug]/components/BackgroundPattern'
import { getPostByIdForGuestCached, IGuestPost } from '@/api/posts'
import { Metadata } from 'next'
import { generateBasicMetadata } from '@/helpers/generateBasicMetadata'
import { WorkoutTypesMap } from '@/consts/workout-types'
import { PATH_TO_IMAGE } from '@/consts/PATH_TO_FILES'
import { Routes } from '@/consts/routes'
import { SharePageHeader } from '@/app/posts/[slug]/components/SharePageHeader'
import RedirectScheme from '@/app/posts/[slug]/components/RedirectScheme'
import { env } from '@/consts/env'
import Script from 'next/script'

interface PostProps {
	params: { slug: string }
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PostProps): Promise<Metadata> {
	const { slug } = await params
	let postData: null | IGuestPost = null
	try {
		postData = await getPostByIdForGuestCached(slug)
	} catch (e) {
		console.log(e)
	}

	const defaultImage = `${env.web_url}/opengraph-image.png`

	if (!postData) {
		return generateBasicMetadata({
			title: 'Хайкерс',
			keywords: 'хайкерс, тренировка',
			description: 'Посмотри тренировку в Hikers',
			openGraph: {
				type: 'article'
			},
			alternates: { canonical: Routes.POSTS }
		})
	}

	return generateBasicMetadata({
		title: `Хайкерс: ${postData.title}`,
		keywords: `${postData.title}, ${WorkoutTypesMap[postData.training.type].name}, хайкерс, hikers, тренировка`,
		description: postData.description || '',
		openGraph: {
			type: 'article',
			publishedTime: postData.createdAt,
			authors: ['пользователь Hikers'],
			url: `${Routes.POSTS}/${postData.id}`,
			image_url: `${postData.fileNames.length ? `${PATH_TO_IMAGE}${postData.fileNames[0]}` : defaultImage}`
		},
		twitter: {
			image: `${postData.fileNames.length ? `${PATH_TO_IMAGE}${postData.fileNames[0]}` : defaultImage}`,
			card: 'summary_large_image',
			app: {
				url: {
					iphone: `hikers://posts/${postData.id}`,
					ipad: `hikers://posts/${postData.id}`,
					googleplay: `${env.web_url}/posts/${postData.id}`
				}
			}
		},
		alternates: {
			canonical: `${Routes.POSTS}/${postData.id}`
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
	let postData: null | IGuestPost = null

	try {
		postData = await getPostByIdForGuestCached(slug)
	} catch (e) {
		console.log(e)
	}

	return (
		<>
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
			{postData && (
				<Script
					id="post-details-ld"
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							'@id': `${env.web_url}/posts/${postData.id}#post`,
							'@context': 'https://schema.org',
							'@type': 'SocialMediaPosting',
							inLanguage: 'ru',
							isPartOf: {
								'@type': 'WebSite',
								name: 'Hikers',
								url: env.web_url
							},
							headline: postData.title,
							...(postData.description && {
								description: postData.description
							}),
							datePublished: postData.createdAt,
							...(postData.updatedAt && {
								dateModified: postData.updatedAt
							}),
							mainEntityOfPage: {
								'@type': 'WebPage',
								'@id': `${env.web_url}/posts/${postData.id}#webpage`
							},
							author: {
								'@type': 'Person',
								//'@id': `${env.web_url}/#user`,
								name: 'Пользователь Hikers'
							},
							publisher: {
								'@type': 'Organization',
								name: 'Hikers',
								logo: {
									'@type': 'ImageObject',
									url: `${env.web_url}/opengraph-image.png`
								}
							},
							image: postData.fileNames.length
								? [`${PATH_TO_IMAGE}${postData.fileNames[0]}`]
								: [`${env.web_url}/opengraph-image.png`],
							url: `${env.web_url}/posts/${postData.id}`,
							interactionStatistic: [
								{
									'@type': 'InteractionCounter',
									interactionType: { '@type': 'LikeAction' },
									userInteractionCount: postData.likesCount || 0
								}
							],
							articleSection: WorkoutTypesMap[postData.training.type].name,
							about: {
								'@type': 'ExercisePlan',
								name: WorkoutTypesMap[postData.training.type].name
							}
						})
					}}
				/>
			)}
		</>
	)
}

export default Post
