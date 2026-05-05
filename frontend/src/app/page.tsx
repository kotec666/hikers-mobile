import { Metadata } from 'next'
import { generateBasicMetadata } from '@/helpers/generateBasicMetadata'
import PhoneSceneWrapper from '@/app/components/main-page/PhoneSceneWrapper'

export const metadata: Metadata = generateBasicMetadata({
	title: 'Главная страница',
	description: 'Описание',
	keywords: 'ключевые, слова'
})

export default function Home() {
	return (
		<div className="h-[800vh] relative z-[-100] ">
			<div className="fixed z-[-25] top-0 h-screen w-full bg-[radial-gradient(circle,rgba(200,0,0,1)_0%,rgba(0,0,0,1)_100%)]" />
			<div className="sceneWrap fixed -z-10 top-0 h-screen w-full ">
				<PhoneSceneWrapper />
			</div>

			<div className="up z-10  w-full absolute overflow-hidden hidden md:inline-block">
				<div className="page h-screen ">
					<div className="container m-auto flex flex-col justify-end items-end h-screen">
						<p className="text-white lg:w-2xl px-2.5 text-[1rem] lg:text-2xl mb-20 ">
							The Nissan Silvia (Japanese: 日産・シルビア, Hepburn: Nissan Shirubia) is the series of
							small sports cars produced by Nissan. Versions of the Silvia have been marketed as the 200SX
							or 240SX for export, with some export versions being sold under the Datsun brand.
						</p>
					</div>
				</div>
				<div className="page h-screen ">
					<div className="container m-auto flex flex-col justify-end items-end h-screen">
						<p className="text-white text-center text-[1rem] lg:text-2xl mb-20 ">
							The Nissan Silvia S15 was the final and most refined version of the Silvia lineup, produced
							from 1999 to 2002. It was powered by the SR20DET , a 2.0L turbocharged inline-four engine,
							producing around 250 hp in the Spec-R model. This version featured a ball-bearing turbo ,
							improved cooling, and a 6-speed manual transmission , making it a favorite among
							enthusiasts. The non-turbo SR20DE version was also available, delivering around 165 hp .
							Thanks to its lightweight chassis, rear-wheel drive layout, and tunable engine, the S15
							remains a top choice for drifting and performance builds.
						</p>
					</div>
				</div>
				<div className="page h-screen"></div>
				<div className="page h-screen ">
					<div className="container m-auto flex flex-col justify-end items-end h-screen">
						<p className="text-white  lg:w-2xl px-2.5 md:text-[1rem] lg:text-xl ">
							The Nissan Silvia S15 is a true Japanese legend, known for its balance, agility, and
							drifting prowess. With a lightweight chassis, turbocharged SR20DET engine, and
							rear-wheel-drive layout, it became a favorite in street racing and motorsports. The S15
							dominated touge battles and drift competitions, cementing its status in JDM culture. Its
							sleek design and performance keep it highly sought after, and with the US import ban nearing
							its end, its legacy as a top-tier JDM icon continues to grow.
						</p>
					</div>
				</div>
				<div className="page h-screen "></div>
				<div className="page h-screen "></div>
				<div className="page h-screen "></div>
				<div className="page h-screen ">
					<div className="container m-auto flex flex-col justify-end items-center h-screen">
						<p className="text-white  text-[11 em] lg:text-2xl  mb-10">
							ффффффффффффф фффф фффф фффффффффффффф
						</p>
					</div>
				</div>
			</div>
			<div className="down -z-20  w-full  absolute  overflow-hidden ">
				<div className="page h-screen ">
					<div className="container m-auto flex flex-col justify-center h-[50vh]">
						<h4 className="lg:text-[5rem] text-[3rem] text-white font-bold pl-3">Nissan</h4>
						<h1 className="text-[6rem] pl-3 lg:text-[18rem] leading-10 mb-10 lg:mb-0 lg:leading-44 text-white font-bold ">
							SILVIA
						</h1>
					</div>
				</div>
				<div className="page h-screen">
					<div className="container m-auto flex flex-col justify-center items-center h-[50vh]">
						<h1 className="text-[6rem] lg:text-[18rem] leading-10 mb-10 lg:mb-0 lg:leading-44 text-white font-bold ">
							LS V8
						</h1>
						<h4 className="text-[5rem] text-white font-bold">engine</h4>
					</div>
				</div>
				<div className="page h-screen "></div>
				<div className="page h-screen ">
					<div className="container m-auto flex flex-col justify-center items-end h-[50vh]">
						<h4 className=" xl:text-[5rem] text-[2rem]  text-white font-bold mt-80">Japanese</h4>
						<h1 className="text-[6rem]  leading-none xl:text-[18rem]  mb-10 xl:mb-0 xl:leading-44 text-white font-bold ">
							Legend
						</h1>
					</div>
				</div>
				<div className="page h-screen "></div>
				<div className="page h-screen "></div>
				<div className="page h-screen "></div>
				<div className="page h-screen ">
					<div className="container m-auto flex flex-col justify-center items-center h-[50vh]">
						<h4 className="text-[1rem] lg:text-[4rem] text-white font-bold">
							The Nissan Silvia isn’t just a car
						</h4>
						<h1 className="text-[1rem] lg:text-[3rem] leading-none text-center lg:leading-20 text-white font-bold  mb-20">
							&#34;it’s a statement of style, speed, and pure driving passion.&#34;
						</h1>
					</div>
				</div>
			</div>
		</div>
	)
}
