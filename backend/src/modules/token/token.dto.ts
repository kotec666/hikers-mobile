export namespace Token {
	export type TokenResponse = {
		token: string;
	};

	// Полезная нагрузка в токене
	export type Payload = {
		id: string;
	};

	// access token содержит полезную нагрузку & системную инфу
	export type Access = Payload & {
		// Системная информация
		hs: string; // Хэш уникального набора символов для связи access с refresh токеном
		iat: number;
		exp: number;
	};

	// Refresh token содержит полезную нагрузку & системную инфу
	export type Refresh = Payload & {
		// Системная информация
		s: string; // Уникальный набор символов для связи access с refresh токеном
		iat: number;
		exp: number;
	};
}
