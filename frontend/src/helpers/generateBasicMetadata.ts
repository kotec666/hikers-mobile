import { Metadata } from 'next';
import { env } from '@/consts/env';

interface IMetaEnter {
	title?: string;
	description?: string;
	keywords?: string;
	robots?: string;
	alternates?: {
		canonical?: string;
		languages?: {
			[key: string]: string;
		};
	};
	openGraph?: {
		url?: string;
		image_url?: string;
		width?: number;
		height?: number;
		type?: 'website' | 'article' | 'profile';
		publishedTime?: string;
		modifiedTime?: string;
		authors?: string[];
	};
	twitter?: {
		card?: 'summary' | 'summary_large_image' | 'app' | 'player';
		site?: string;
		creator?: string;
		title?: string;
		description?: string;
		image?: string;
		app?: {
			name: string;
			id: string;
			url: string;
		};
	};
}

export const generateBasicMetadata = (meta: IMetaEnter): Metadata => {
	const siteName = 'Hikers';
	const defaultImage = `${env.web_url}/opengraph-image.png`;
	const defaultTwitterImage = `${env.web_url}/opengraph-image.png`;

	// Basic metadata
	const metadata: Metadata = {
		title: meta.title,
		description: meta.description,
		keywords: meta.keywords,
		manifest: '/manifest.json',
		robots: meta.robots || 'index, follow',
		authors: [{ name: 'hikers' }],
		creator: 'hikers',
		publisher: 'hikers',
		formatDetection: {
			email: false,
			address: false,
			telephone: false,
		},
		// verification: {
		//     google: env.google_verification,
		//     yandex: env.yandex_verification,
		// },
		category: 'technology',
		alternates: {
			canonical: meta?.alternates?.canonical ? `${env.web_url}${meta.alternates.canonical}` : env.web_url,
			// languages: meta?.alternates?.languages || {
			//   "en-US": "/",
			//   // "ru-RU": "/ru-RU",
			// },
		},
	};

	// OpenGraph metadata
	metadata.openGraph = {
		title: meta.title,
		description: meta.description,
		type: meta.openGraph?.type || 'website',
		url: `${env.web_url}${meta?.openGraph?.url || ''}`,
		siteName: siteName,
		images: [
			{
				url: meta.openGraph?.image_url || defaultImage,
				width: meta.openGraph?.width || 1200,
				height: meta.openGraph?.height || 630,
				alt: meta.title || 'Hikers website',
			},
		],
		locale: 'ru_RU',
		...(meta.openGraph?.type === 'article' && {
			article: {
				publishedTime: meta.openGraph.publishedTime,
				modifiedTime: meta.openGraph.modifiedTime,
				authors: meta.openGraph.authors,
			},
		}),
	};

	// Twitter Cards metadata
	metadata.twitter = {
		card: meta.twitter?.card || 'summary_large_image',
		site: meta.twitter?.site || `@${siteName}`,
		creator: meta.twitter?.creator || `@${siteName}`,
		title: meta.twitter?.title || meta.title,
		description: meta.twitter?.description || meta.description,
		images: [meta.twitter?.image || defaultTwitterImage],
		...(meta.twitter?.app && {
			app: {
				id: meta.twitter.app.id,
				url: meta.twitter.app.url,
				name: meta.twitter.app.name,
			},
		}),
	};

	return metadata;
};
