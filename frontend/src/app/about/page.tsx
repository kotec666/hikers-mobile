import React from 'react'
import { Metadata } from 'next'
import { generateBasicMetadata } from '@/helpers/generateBasicMetadata'
import MainLayout from '@/components/layout/main-layout'
import Container from '@/components/layout/container'

export const metadata: Metadata = generateBasicMetadata({
	title: 'Hikers | Описание',
	description:
		'О приложении Хайкерс – тренировки, публикации и сообщество для тех, кто бегает, крутит педали и ходит в горы.',
	keywords: 'Хайкерс, о приложении, бег, вело, хайкинг, сообщество'
})

export default function CompanyDescription() {
	return (
		<MainLayout
			headerProps={{
				isAnimationLineDisabled: false
			}}
			mainClassName="bg-black-0d"
		>
			<Container className="py-12 md:py-20 flex justify-center">
				<div className="max-w-3xl">
					<h1 className="text-3xl md:text-5xl font-bold text-white mb-6">О приложении Хайкерс</h1>

					<p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-10">
						Хайкерс создаёт возможность делиться своими достижениями. Тренируйтесь на природе – и
						вдохновляйте других своим прогрессом.
					</p>

					<div className="space-y-8 text-gray-400 leading-relaxed">
						<p>
							Пробежка по утреннему парку, велопоездка за город или поход в горы – какой бы ни была ваша
							активность, всех нас объединяет одно: желание двигаться, тренироваться и становиться лучше.
						</p>

						<p>
							Идея «Хайкерс» родилась из простого наблюдения: обычных приложений для бега недостаточно,
							если хочется не просто зафиксировать цифры, а по-настоящему видеть свой прогресс и делиться
							им с теми, кто разделяет ту же страсть. Так появилось приложение, где тренировки, публикации
							и сообщество работают вместе.
						</p>

						<div className="py-1">
							<p>
								С Хайкерс вы записываете пробежки, сохраняете маршруты и тренируетесь в своём темпе.
								Дистанция, темп, набор высоты, личные рекорды – вся статистика собрана в одном месте,
								чтобы прогресс был виден на каждом этапе.
							</p>
						</div>

						<p>
							А ещё – это сообщество. Делитесь результатами, находите единомышленников, вдохновляйтесь
							чужими маршрутами и рекордами. Бегать, крутить педали и ходить в горы вместе всегда
							интереснее.
						</p>

						<p>
							Наша миссия – помочь каждому тренироваться умнее и превращать личные достижения в истории,
							которыми хочется делиться.
						</p>
					</div>

					<p className="text-lg md:text-xl text-white font-medium mt-12 mb-2">
						Скачайте Хайкерс и начните фиксировать свои результаты уже сегодня.
					</p>

					<p className="text-sm text-gray-500 uppercase tracking-wide mt-8">Команда Хайкерс</p>
				</div>
			</Container>
		</MainLayout>
	)
}
