import { Test } from '@nestjs/testing';
import { TrainingsService } from './trainings.service';
import { DatabaseService } from '../database/database.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { TrainingType } from '@shared/enums';

// Мокаем хелперы из @shared/helpers
jest.mock('@shared/helpers', () => ({
	haversineDistance: jest.fn().mockReturnValue(100), // 100 метров
	calculateCalories: jest.fn().mockReturnValue(500),
}));

// Мокаем хелперы из @helpers
jest.mock('@helpers', () => ({
	round: jest.fn((num) => Math.round(num)),
	clampToPgInt: jest.fn((_, value) => value),
}));

describe('TrainingsService - finish', () => {
	let service: TrainingsService;
	let mockDb: any;
	let mockEventEmitter: any;

	beforeEach(async () => {
		// Создаём мок для DatabaseService
		mockDb = {
			db: {
				transaction: jest.fn(),
				update: jest.fn().mockReturnThis(),
				set: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				delete: jest.fn().mockReturnThis(),
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				innerJoin: jest.fn().mockReturnThis(),
				leftJoin: jest.fn().mockReturnThis(),
				limit: jest.fn().mockReturnThis(),
				offset: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
			},
		};

		// Мокаем EventEmitter
		mockEventEmitter = {
			emit: jest.fn(),
		};

		const mockDatabaseService = {
			db: mockDb.db,
		};

		const moduleRef = await Test.createTestingModule({
			providers: [
				TrainingsService,
				{
					provide: DatabaseService,
					useValue: mockDatabaseService,
				},
				{
					provide: EventEmitter2,
					useValue: mockEventEmitter,
				},
			],
		}).compile();

		service = moduleRef.get<TrainingsService>(TrainingsService);
	});

	describe('finish', () => {
		const userId = 'user-123';
		const trainingId = 'training-456';
		const mockActiveTraining = {
			id: trainingId,
			type: TrainingType.RUN,
			creatorId: userId,
			createdAt: new Date('2024-01-01T09:55:00Z'),
			startedAt: new Date('2024-01-01T10:00:00Z'),
			finishedAt: null,
		};

		it('должен успешно завершить тренировку и рассчитать метрики', async () => {
			// Мокаем getActive - возвращает активную тренировку
			jest.spyOn(service as any, 'getActive').mockResolvedValue([mockActiveTraining]);

			// Мокаем upsertMetrics
			jest.spyOn(service as any, 'upsertMetrics').mockResolvedValue({ success: true });

			// Мокаем транзакцию
			mockDb.db.transaction.mockImplementation(async (callback: any) => {
				const tx = {
					update: jest.fn().mockReturnThis(),
					set: jest.fn().mockReturnThis(),
					where: jest.fn().mockReturnThis(),
					delete: jest.fn().mockReturnThis(),
				};
				return await callback(tx);
			});

			const result = await service.finish(userId);

			expect(result).toEqual({ success: true });
			expect(mockEventEmitter.emit).toHaveBeenCalledWith(expect.any(String), mockActiveTraining.id);
			expect(service['upsertMetrics']).toHaveBeenCalledWith(mockActiveTraining.id, mockActiveTraining.type);
		});

		it('должен выбросить NotFoundException, если нет активной тренировки', async () => {
			jest.spyOn(service as any, 'getActive').mockResolvedValue([]);

			await expect(service.finish(userId)).rejects.toThrow(NotFoundException);
			expect(mockEventEmitter.emit).not.toHaveBeenCalled();
		});

		it('должен выбросить ConflictException, если ts меньше startedAt', async () => {
			jest.spyOn(service as any, 'getActive').mockResolvedValue([mockActiveTraining]);
			const pastTimestamp = mockActiveTraining.startedAt.getTime() - 1000;

			await expect(service.finish(userId, pastTimestamp)).rejects.toThrow(ConflictException);
		});

		it('должен использовать переданный ts как finishedAt', async () => {
			jest.spyOn(service as any, 'getActive').mockResolvedValue([mockActiveTraining]);
			jest.spyOn(service as any, 'upsertMetrics').mockResolvedValue({ success: true });

			const futureTimestamp = Date.now() + 10000;
			let capturedUpdateData: any = null;

			mockDb.db.transaction.mockImplementation(async (callback: any) => {
				const tx = {
					update: jest.fn().mockReturnThis(),
					set: jest.fn().mockImplementation((data) => {
						capturedUpdateData = data;
						return tx;
					}),
					where: jest.fn().mockReturnThis(),
					delete: jest.fn().mockReturnThis(),
				};
				return await callback(tx);
			});

			await service.finish(userId, futureTimestamp);

			expect(capturedUpdateData.finishedAt).toBeInstanceOf(Date);
			expect(capturedUpdateData.finishedAt.getTime()).toBeCloseTo(futureTimestamp, -2);
		});

		it('должен удалить инвайты после завершения тренировки', async () => {
			jest.spyOn(service as any, 'getActive').mockResolvedValue([mockActiveTraining]);
			jest.spyOn(service as any, 'upsertMetrics').mockResolvedValue({ success: true });

			let deleteCalledWith: any = null;

			mockDb.db.transaction.mockImplementation(async (callback: any) => {
				const tx = {
					update: jest.fn().mockReturnThis(),
					set: jest.fn().mockReturnThis(),
					where: jest.fn().mockReturnThis(),
					delete: jest.fn().mockImplementation((...args) => {
						deleteCalledWith = args;
						return tx;
					}),
				};
				return await callback(tx);
			});

			await service.finish(userId);

			expect(deleteCalledWith).toBeDefined();
		});

		it('должен вернуть { success: false } если upsertMetrics упал', async () => {
			jest.spyOn(service as any, 'getActive').mockResolvedValue([mockActiveTraining]);
			jest.spyOn(service as any, 'upsertMetrics').mockRejectedValue(new Error('DB error'));

			let consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

			mockDb.db.transaction.mockImplementation(async (callback: any) => {
				const tx = {
					update: jest.fn().mockReturnThis(),
					set: jest.fn().mockReturnThis(),
					where: jest.fn().mockReturnThis(),
					delete: jest.fn().mockReturnThis(),
				};
				return await callback(tx);
			});

			const result = await service.finish(userId);

			expect(result).toEqual({ success: false });
			expect(consoleLogSpy).toHaveBeenCalled();
			expect(mockEventEmitter.emit).not.toHaveBeenCalled();

			consoleLogSpy.mockRestore();
		});
	});

	describe('calcMetrics (внутренний метод)', () => {
		it('должен правильно рассчитать метрики для тренировки с 1 паузой', () => {
			const mockParticipant = {
				id: 'participant-1',
				route: {
					points: [
						{ rel_ts: 0, distance: 0, alt: 100, paused: false },
						{ rel_ts: 60000, distance: 500, alt: 120, paused: false }, // 1 минута, 500м
						{ rel_ts: 120000, distance: 500, alt: 140, paused: false }, // 2 минуты, ещё 500м
					],
				},
			} as any;

			const metrics = service['calcMetrics'](mockParticipant, TrainingType.RUN);

			expect(metrics.distanceM).toBe(1000); // 500 + 500
			expect(metrics.altitudeGainM).toBe(40); // 140 - 100
			expect(metrics.timeSec).toBe(120); // 120000ms / 1000
			expect(metrics.avgSpeedMPerSec).toBeCloseTo(8, 2); // 1000m / 120s
		});

		it('должен корректно исключить время 1 паузы', () => {
			const mockParticipant = {
				id: 'participant-1',
				route: {
					points: [
						{ rel_ts: 0, distance: 0, alt: 100, paused: false },
						{ rel_ts: 60000, distance: 500, alt: 110, paused: true }, // пауза началась
						{ rel_ts: 120000, distance: 500, alt: 110, paused: true }, // пауза продолжается
						{ rel_ts: 180000, distance: 500, alt: 120, paused: false }, // пауза закончилась
					],
				},
			} as any;

			const metrics = service['calcMetrics'](mockParticipant, TrainingType.RUN);

			// Активное время: 60с (до паузы) + 60с (после паузы) = 120с, а не 180с общих
			expect(metrics.timeSec).toBe(120);
			expect(metrics.distanceM).toBe(1000);
		});

		it('должен корректно обработать 3 паузы в рамках одной тренировки', () => {
			const mockParticipant = {
				id: 'participant-1',
				route: {
					points: [
						// Сегмент 1: активное движение
						{ rel_ts: 0, distance: 0, alt: 100, paused: false },
						{ rel_ts: 30000, distance: 250, alt: 110, paused: false }, // 30 сек
						// пройденное distanceM=250м

						// Пауза 1: 30 секунд (с 30 по 60 секунду)
						{ rel_ts: 30000, distance: 250, alt: 110, paused: true }, // начало паузы
						// пройденное distanceM=500м (+250м с первой точки паузы)
						{ rel_ts: 60000, distance: 250, alt: 110, paused: true }, // конец паузы

						// Сегмент 2: активное движение после паузы
						{ rel_ts: 60000, distance: 250, alt: 110, paused: false },
						{ rel_ts: 90000, distance: 500, alt: 125, paused: false }, // 30 сек
						// пройденное distanceM=1250м (+250м, +500м)

						// Пауза 2: 45 секунд (с 90 по 135 секунду)
						{ rel_ts: 90000, distance: 500, alt: 125, paused: true }, // начало паузы
						// пройденное distanceM=1750м (+500м с первой точки паузы)
						{ rel_ts: 135000, distance: 500, alt: 125, paused: true }, // конец паузы

						// Сегмент 3: активное движение после второй паузы
						{ rel_ts: 135000, distance: 500, alt: 125, paused: false },
						{ rel_ts: 165000, distance: 750, alt: 140, paused: false }, // 30 сек
						// пройденное distanceM=3000м (+500м, +750м)

						// Пауза 3: 20 секунд (с 165 по 185 секунду)
						{ rel_ts: 165000, distance: 750, alt: 140, paused: true }, // начало паузы
						// пройденное distanceM=3750м (+750м с первой точки паузы)
						{ rel_ts: 185000, distance: 750, alt: 140, paused: true }, // конец паузы

						// Финальный сегмент: активное движение
						{ rel_ts: 185000, distance: 750, alt: 140, paused: false },
						{ rel_ts: 215000, distance: 1000, alt: 155, paused: false }, // 30 сек
						// пройденное distanceM=5500м (+750м, +1000м)
					],
				},
			} as any;

			const metrics = service['calcMetrics'](mockParticipant, TrainingType.RUN);

			// Общая дистанция: все активные сегменты
			expect(metrics.distanceM).toBe(5500);

			// Набор высоты: максимальное отклонение от стартовой высоты
			// Старт: 100м, Максимум: 155м -> набор 55м
			expect(metrics.altitudeGainM).toBe(55);

			// Активное время: только время движения (без пауз)
			// Сегмент1: 30с + Сегмент2: 30с + Сегмент3: 30с + Финальный: 30с = 120 секунд
			expect(metrics.timeSec).toBe(120);

			// Средняя скорость: дистанция / активное время
			// 5500 / 120с = 45.8 м/с
			expect(metrics.avgSpeedMPerSec).toBeCloseTo(46, 2);

			// Темп: секунд на км = (время_сек / (дистанция_м / 1000))
			// 120с / 5.5км = 21.8 сек/км
			expect(metrics.avgTempoSecondsPerKm).toBeCloseTo(22, 2);
		});

		it('должен корректно обработать ситуацию, когда паузы идут подряд без движения между ними', () => {
			const mockParticipant = {
				id: 'participant-1',
				route: {
					points: [
						// Начало тренировки
						{ rel_ts: 0, distance: 0, alt: 100, paused: false },
						{ rel_ts: 60000, distance: 500, alt: 120, paused: false }, // 1 минута движения
						// пройденное distanceM=500м (+500м)

						// Первая пауза
						{ rel_ts: 60000, distance: 500, alt: 120, paused: true },
						// пройденное distanceM=1000м (+500м с первой точки паузы)
						{ rel_ts: 90000, distance: 500, alt: 120, paused: true }, // 30 сек паузы

						// Вторая пауза (сразу после первой, без движения)
						{ rel_ts: 90000, distance: 500, alt: 120, paused: true },
						{ rel_ts: 120000, distance: 500, alt: 120, paused: true }, // ещё 30 сек паузы

						// Третья пауза (подряд)
						{ rel_ts: 120000, distance: 500, alt: 120, paused: true },
						{ rel_ts: 150000, distance: 500, alt: 120, paused: true }, // ещё 30 сек паузы

						// Возобновление движения
						{ rel_ts: 150000, distance: 500, alt: 120, paused: false },
						{ rel_ts: 210000, distance: 1000, alt: 140, paused: false }, // 1 минута движения
						// пройденное distanceM=2500м (+500м, +1000м)
					],
				},
			} as any;

			const metrics = service['calcMetrics'](mockParticipant, TrainingType.RUN);

			// Дистанция: только активные сегменты
			expect(metrics.distanceM).toBe(2500);

			// Активное время: 60с + 60с = 120 секунд (паузы 90 секунд исключены)
			expect(metrics.timeSec).toBe(120);

			// Паузы не должны влиять на набор высоты
			expect(metrics.altitudeGainM).toBe(40); // 140 - 100

			// Средняя скорость должна рассчитываться только по активному времени
			expect(metrics.avgSpeedMPerSec).toBeCloseTo(21, 2); // 2500 / 120с
		});

		it('должен корректно обработать паузу в самом начале тренировки', () => {
			const mockParticipant = {
				id: 'participant-1',
				route: {
					points: [
						// Пауза до начала движения
						{ rel_ts: 0, distance: 0, alt: 100, paused: true },
						{ rel_ts: 30000, distance: 0, alt: 100, paused: true }, // 30 сек паузы в начале

						// Реальное начало движения
						{ rel_ts: 30000, distance: 0, alt: 100, paused: false },
						{ rel_ts: 60000, distance: 250, alt: 110, paused: false }, // 30 сек движения
						{ rel_ts: 90000, distance: 500, alt: 120, paused: false }, // ещё 30 сек
						// пройденное distanceM=750м (+250м, +500м)
					],
				},
			} as any;

			const metrics = service['calcMetrics'](mockParticipant, TrainingType.RUN);

			// Пауза в начале не должна учитываться
			expect(metrics.timeSec).toBe(60); // Только 60 секунд активного движения
			expect(metrics.distanceM).toBe(750);
			expect(metrics.avgSpeedMPerSec).toBeCloseTo(13, 2); // 750м / 60с
			expect(metrics.altitudeGainM).toBe(20); // 120 - 100
		});

		it('должен корректно обработать паузу в самом конце тренировки', () => {
			const mockParticipant = {
				id: 'participant-1',
				route: {
					points: [
						// Активное движение
						{ rel_ts: 0, distance: 0, alt: 100, paused: false },
						{ rel_ts: 60000, distance: 500, alt: 120, paused: false }, // 1 минута
						{ rel_ts: 120000, distance: 1000, alt: 140, paused: false }, // ещё 1 минута
						// пройденное distanceM=1500м (+500м, +1000м)

						// Пауза в конце (не должно влиять на метрики)
						{ rel_ts: 120000, distance: 1000, alt: 140, paused: true },
						// пройденное distanceM=2500м (+1000м с первой точки паузы)
						{ rel_ts: 180000, distance: 1000, alt: 140, paused: true }, // 1 минута паузы
						{ rel_ts: 240000, distance: 1000, alt: 140, paused: true }, // ещё 1 минута
					],
				},
			} as any;

			const metrics = service['calcMetrics'](mockParticipant, TrainingType.RUN);

			// Пауза в конце не учитывается
			expect(metrics.timeSec).toBe(120); // Только 120 секунд активного движения
			expect(metrics.distanceM).toBe(2500);
			expect(metrics.avgSpeedMPerSec).toBeCloseTo(21, 2);
			expect(metrics.altitudeGainM).toBe(40);
		});

		it('должен вернуть нулевые метрики для участника без маршрута', () => {
			const mockParticipant = {
				id: 'participant-1',
				route: null,
			} as any;

			const metrics = service['calcMetrics'](mockParticipant, TrainingType.RUN);

			expect(metrics.distanceM).toBe(0);
			expect(metrics.timeSec).toBe(0);
			expect(metrics.avgSpeedMPerSec).toBe(0);
			expect(metrics.avgTempoSecondsPerKm).toBe(0);
			expect(metrics.altitudeGainM).toBe(0);
			expect(metrics.kkcal).toBe(500); // calculateCalories мокнули на 500
		});

		it('должен корректно рассчитать набор высоты (максимальное отклонение)', () => {
			const mockParticipant = {
				id: 'participant-1',
				route: {
					points: [
						{ rel_ts: 0, distance: 0, alt: 100, paused: false },
						{ rel_ts: 60000, distance: 500, alt: 150, paused: false },
						{ rel_ts: 120000, distance: 1000, alt: 120, paused: false }, // спустился
						{ rel_ts: 180000, distance: 1500, alt: 180, paused: false }, // поднялся выше
					],
				},
			} as any;

			const metrics = service['calcMetrics'](mockParticipant, TrainingType.RUN);

			// Максимальное отклонение от стартовой точки: 180 - 100 = 80
			expect(metrics.altitudeGainM).toBe(80);
		});
	});
});
