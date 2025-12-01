import { Metadata } from 'next';
import { generateBasicMetadata } from '@/helpers/generateBasicMetadata';

export const metadata: Metadata = generateBasicMetadata({
	title: 'Главная страница',
	description: 'Описание',
	keywords: 'ключевые, слова',
});

export default function Home() {
	return (
		<div className="flex border-[50px] border-blue-400 text-lg rounded-full justify-center">
			<div style={{ border: '50px solid blue' }} className="text-blue-400 p-5">
				I can not sell this domain for 500,000$; Do not contact me in telegram
			</div>
		</div>
	);
}
