export namespace AchievementDto {
	export type Entity = {
		id: string;
		iconFilename: string | null;
		colorHex: string | null;
		title: string;
		description: string | null;
		/** У какого процента юзеров уже есть эта ачивка? (от 0.00 до 100.00) */
		claimedPercent: string;
		/** Метка времени. Если null - значит ещё не получено */
		claimedAt: Date | null;
	};
}
