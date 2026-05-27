module.exports = {
	// Используем ts-jest для TypeScript файлов
	preset: 'ts-jest',

	// Среда выполнения (Node.js для бекенда)
	testEnvironment: 'node',

	// Корневая директория с тестами
	roots: ['<rootDir>/src'],

	// Какие файлы считать тестами
	testRegex: '.*\\.spec\\.ts$',

	// Обработка файлов
	moduleFileExtensions: ['js', 'json', 'ts'],

	// Трансформация TypeScript через ts-jest
	transform: {
		'^.+\\.(t|j)s$': 'ts-jest',
	},

	// Пропустить node_modules (кроме тех, что нужно трансформировать)
	transformIgnorePatterns: ['/node_modules/(?!(your-esm-module)/)'],

	// Пути к модулям (ВАЖНО для алиасов @shared, @helpers и т.д.)
	moduleNameMapper: {
		'^@shared/(.*)$': '<rootDir>/src/shared/$1',
		'^@helpers$': '<rootDir>/src/common/helpers.ts',
		'^@validation/(.*)$': '<rootDir>/src/common/validation/$1',
		'^@events/(.*)$': '<rootDir>/src/common/events/$1',
	},

	// Путь до папки с покрытием
	coverageDirectory: './coverage',

	// Собирать покрытие только с этих файлов
	collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/*.module.ts', '!src/main.ts'],

	// Настройки ts-jest
	globals: {
		'ts-jest': {
			tsconfig: 'tsconfig.json',
			diagnostics: false,
		},
	},
};
