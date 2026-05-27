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
		it('должен правильно рассчитать метрики для тренировки с точками', () => {
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

		it('должен корректно исключить время пауз из расчётов', () => {
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
