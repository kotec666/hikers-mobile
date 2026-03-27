import { MeasuringUnit, UserActivity } from '@shared/enums';

interface AchievementSeedData {
	type: UserActivity;
	measuringUnit: MeasuringUnit;
	targetProgress: number;
	colorHex: string;
	title: string;
	description?: string;
}

export const achievementsSeedData: AchievementSeedData[] = [
	// Бег (RUN)
	{
		type: UserActivity.RUN,
		measuringUnit: MeasuringUnit.KILOMETER,
		targetProgress: 5,
		colorHex: '#FF6B6B',
		title: 'Пробежать 5 километров',
		description: 'Преодолеть дистанцию в 5 км бегом за одну тренировку',
	},
	{
		type: UserActivity.RUN,
		measuringUnit: MeasuringUnit.KILOMETER,
		targetProgress: 10,
		colorHex: '#FF8C42',
		title: 'Пробежать 10 километров',
		description: 'Преодолеть дистанцию в 10 км бегом за одну тренировку',
	},
	{
		type: UserActivity.RUN,
		measuringUnit: MeasuringUnit.KILOMETER,
		targetProgress: 21,
		colorHex: '#F9C74F',
		title: 'Пробежать полумарафон',
		description: 'Преодолеть дистанцию в 21.1 км бегом за одну тренировку',
	},
	{
		type: UserActivity.RUN,
		measuringUnit: MeasuringUnit.KILOMETER,
		targetProgress: 42,
		colorHex: '#90BE6D',
		title: 'Пробежать марафон',
		description: 'Преодолеть дистанцию в 42.2 км бегом за одну тренировку',
	},
	{
		type: UserActivity.RUN,
		measuringUnit: MeasuringUnit.KILOMETER,
		targetProgress: 100,
		colorHex: '#43AA8B',
		title: 'Пробежать 100 километров',
		description: 'Суммарно преодолеть 100 км бегом за все тренировки',
	},
	{
		type: UserActivity.RUN,
		measuringUnit: MeasuringUnit.KILOMETER,
		targetProgress: 500,
		colorHex: '#4D908E',
		title: 'Пробежать 500 километров',
		description: 'Суммарно преодолеть 500 км бегом за все тренировки',
	},
	{
		type: UserActivity.RUN,
		measuringUnit: MeasuringUnit.KILOMETER,
		targetProgress: 1000,
		colorHex: '#577590',
		title: 'Пробежать 1000 километров',
		description: 'Суммарно преодолеть 1000 км бегом за все тренировки',
	},

	// Трекинг/ходьба (TRACK)
	{
		type: UserActivity.TRACK,
		measuringUnit: MeasuringUnit.KILOMETER,
		targetProgress: 5,
		colorHex: '#A9D6E5',
		title: 'Пройти 5 километров',
		description: 'Преодолеть расстояние в 5 км пешком за одну тренировку',
	},
	{
		type: UserActivity.TRACK,
		measuringUnit: MeasuringUnit.KILOMETER,
		targetProgress: 10,
		colorHex: '#89C2D9',
		title: 'Пройти 10 километров',
		description: 'Преодолеть расстояние в 10 км пешком за одну тренировку',
	},
	{
		type: UserActivity.TRACK,
		measuringUnit: MeasuringUnit.KILOMETER,
		targetProgress: 100,
		colorHex: '#284B63',
		title: 'Пройти 100 километров',
		description: 'Суммарно преодолеть 100 км пешком за все тренировки',
	},

	// Велосипед (BICYCLE)
	{
		type: UserActivity.BICYCLE,
		measuringUnit: MeasuringUnit.KILOMETER,
		targetProgress: 10,
		colorHex: '#6C9EBF',
		title: 'Проехать 10 километров',
		description: 'Преодолеть дистанцию в 10 км на велосипеде за один заезд',
	},
	{
		type: UserActivity.BICYCLE,
		measuringUnit: MeasuringUnit.KILOMETER,
		targetProgress: 25,
		colorHex: '#4C7A8A',
		title: 'Проехать 25 километров',
		description: 'Преодолеть дистанцию в 25 км на велосипеде за один заезд',
	},
	{
		type: UserActivity.BICYCLE,
		measuringUnit: MeasuringUnit.KILOMETER,
		targetProgress: 50,
		colorHex: '#2C5A6A',
		title: 'Проехать 50 километров',
		description: 'Преодолеть дистанцию в 50 км на велосипеде за один заезд',
	},
	{
		type: UserActivity.BICYCLE,
		measuringUnit: MeasuringUnit.KILOMETER,
		targetProgress: 100,
		colorHex: '#1C3A4A',
		title: 'Проехать 100 километров',
		description: 'Преодолеть дистанцию в 100 км на велосипеде за один заезд',
	},
];
