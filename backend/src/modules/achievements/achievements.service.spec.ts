import { Test, TestingModule } from '@nestjs/testing';
import { AchievementsService } from './achievements.service';
import { DatabaseService } from '../database/database.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MeasuringUnit, TrainingType, UserActivity } from '@shared/enums';
import { getActivityByTrainingType } from '../activities/helpers';
import { AVERAGE_STRIDE_LENGTH } from '@shared/constants';

// Mock the helpers
jest.mock('../activities/helpers', () => ({
	getActivityByTrainingType: jest.fn(),
}));

describe('AchievementsService - handleTrainingFinished', () => {
	let service: AchievementsService;
	let databaseService: DatabaseService;
	let notificationsService: NotificationsService;

	const mockAddProgress = jest.fn();
	const mockSetProgress = jest.fn();

	const mockNotificationsService = {
		create: jest.fn().mockResolvedValue({}),
	};

	beforeEach(async () => {
		jest.clearAllMocks();
		(mockAddProgress as jest.Mock).mockResolvedValue({ success: true });
		(mockSetProgress as jest.Mock).mockResolvedValue({ success: true });

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AchievementsService,
				{
					provide: DatabaseService,
					useValue: {
						db: {
							select: jest.fn(),
							from: jest.fn(),
							where: jest.fn(),
							innerJoin: jest.fn(),
							update: jest.fn(),
							set: jest.fn(),
							insert: jest.fn(),
							values: jest.fn(),
							onConflictDoUpdate: jest.fn(),
							returning: jest.fn(),
						},
					},
				},
				{
					provide: NotificationsService,
					useValue: mockNotificationsService,
				},
				{
					provide: EventEmitter2,
					useValue: {
						emit: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<AchievementsService>(AchievementsService);
		databaseService = module.get<DatabaseService>(DatabaseService);
		notificationsService = module.get<NotificationsService>(NotificationsService);

		// Mock private methods that are called internally
		(service as any).addProgress = mockAddProgress;
		(service as any).setProgress = mockSetProgress;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('handleTrainingFinished', () => {
		it('should return early when no participants found', async () => {
			const trainingId = 'training-id';
			const emptyParticipants: any[] = [];

			const mockQueryChain = {
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				innerJoin: jest.fn().mockReturnThis(),
				then: jest.fn((resolve) => {
					resolve(emptyParticipants);
					return Promise.resolve(emptyParticipants);
				}),
			};

			databaseService.db.select = jest.fn().mockReturnValue(mockQueryChain);

			await (service as any).handleTrainingFinished(trainingId);

			expect(databaseService.db.select).toHaveBeenCalled();
			expect(mockQueryChain.innerJoin).toHaveBeenCalledTimes(2);
			expect(mockAddProgress).not.toHaveBeenCalled();
		});

		it('should handle RUN training type correctly', async () => {
			const trainingId = 'run-training-id';
			const participants = [
				{
					type: TrainingType.RUN,
					userId: 'user-1',
					metrics: {
						timeSec: 120,
						avgSpeedMPerSec: 5.5,
						avgTempoSecondsPerKm: 300,
						distanceM: 5000,
						altitudeGainM: 50,
						kkcal: 400,
					},
				},
			];

			const mockAchievementsByType = {
				[UserActivity.RUN]: [
					{ id: 'ach-1', type: UserActivity.RUN, measuringUnit: MeasuringUnit.KILOMETER, targetProgress: 10 },
					{ id: 'ach-5', type: UserActivity.RUN, measuringUnit: MeasuringUnit.METER, targetProgress: 6000 },
				],
				[UserActivity.STEPS]: [
					{
						id: 'ach-2',
						type: UserActivity.STEPS,
						measuringUnit: MeasuringUnit.COUNT,
						targetProgress: 10000,
					},
				],
				[UserActivity.BICYCLE]: [
					{
						id: 'ach-3',
						type: UserActivity.BICYCLE,
						measuringUnit: MeasuringUnit.KILOMETER,
						targetProgress: 11,
					},
				],
				[UserActivity.TRACK]: [
					{
						id: 'ach-4',
						type: UserActivity.TRACK,
						measuringUnit: MeasuringUnit.KILOMETER,
						targetProgress: 12,
					},
				],
			};

			const mockQueryChain = {
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				innerJoin: jest.fn().mockReturnThis(),
				then: jest.fn((resolve) => {
					resolve(participants);
				}),
			};

			const getMockAchievementsQueryChain = (type: UserActivity) => ({
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				then: jest.fn((resolve) => {
					resolve(mockAchievementsByType[type]);
				}),
			});

			databaseService.db.select = jest
				.fn()
				.mockReturnValueOnce(mockQueryChain)
				.mockReturnValueOnce(getMockAchievementsQueryChain(UserActivity.STEPS))
				.mockReturnValueOnce(getMockAchievementsQueryChain(UserActivity.RUN));

			(getActivityByTrainingType as jest.Mock).mockReturnValue(UserActivity.RUN);

			await (service as any).handleTrainingFinished(trainingId);

			const expectedDistanceKm = Math.trunc(participants[0].metrics.distanceM / 1000);
			const expectedStepsCount = Math.trunc(participants[0].metrics.distanceM / AVERAGE_STRIDE_LENGTH);

			expect(mockAddProgress).toHaveBeenCalledTimes(3);
			expect(mockAddProgress).toHaveBeenCalledWith('user-1', 'ach-2', expectedStepsCount); // 5000m / AVERAGE_STRIDE_LENGTH
			expect(mockAddProgress).toHaveBeenCalledWith('user-1', 'ach-1', expectedDistanceKm); // 5000m / 1000 = 5km
			expect(mockAddProgress).toHaveBeenCalledWith('user-1', 'ach-5', participants[0].metrics.distanceM); // 5000m
		});

		it('should handle WALK training type correctly', async () => {
			const trainingId = 'walk-training-id';
			const participants = [
				{
					type: TrainingType.WALK,
					userId: 'user-1',
					metrics: {
						timeSec: 180,
						avgSpeedMPerSec: 1.4,
						avgTempoSecondsPerKm: 714,
						distanceM: 1500,
						altitudeGainM: 10,
						kkcal: 150,
					},
				},
			];

			const mockAchievementsByType = {
				[UserActivity.RUN]: [
					{ id: 'ach-1', type: UserActivity.RUN, measuringUnit: MeasuringUnit.KILOMETER, targetProgress: 10 },
					{ id: 'ach-5', type: UserActivity.RUN, measuringUnit: MeasuringUnit.METER, targetProgress: 6000 },
				],
				[UserActivity.STEPS]: [
					{
						id: 'ach-2',
						type: UserActivity.STEPS,
						measuringUnit: MeasuringUnit.COUNT,
						targetProgress: 10000,
					},
				],
				[UserActivity.BICYCLE]: [
					{
						id: 'ach-3',
						type: UserActivity.BICYCLE,
						measuringUnit: MeasuringUnit.KILOMETER,
						targetProgress: 11,
					},
				],
				[UserActivity.TRACK]: [
					{
						id: 'ach-4',
						type: UserActivity.TRACK,
						measuringUnit: MeasuringUnit.KILOMETER,
						targetProgress: 12,
					},
				],
			};

			const mockQueryChain = {
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				innerJoin: jest.fn().mockReturnThis(),
				then: jest.fn((resolve) => {
					resolve(participants);
				}),
			};

			const getMockAchievementsQueryChain = (type: UserActivity) => ({
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				then: jest.fn((resolve) => {
					resolve(mockAchievementsByType[type]);
				}),
			});

			databaseService.db.select = jest
				.fn()
				.mockReturnValueOnce(mockQueryChain)
				.mockReturnValueOnce(getMockAchievementsQueryChain(UserActivity.STEPS))
				.mockReturnValueOnce(getMockAchievementsQueryChain(UserActivity.TRACK));

			(getActivityByTrainingType as jest.Mock).mockReturnValue(UserActivity.TRACK);

			await (service as any).handleTrainingFinished(trainingId);

			const expectedDistanceKm = Math.trunc(participants[0].metrics.distanceM / 1000);
			const expectedStepsCount = Math.trunc(participants[0].metrics.distanceM / AVERAGE_STRIDE_LENGTH);

			expect(mockAddProgress).toHaveBeenCalledTimes(2);
			expect(mockAddProgress).toHaveBeenCalledWith('user-1', 'ach-2', expectedStepsCount);
			expect(mockAddProgress).toHaveBeenCalledWith('user-1', 'ach-4', expectedDistanceKm);
		});

		it('should handle BICYCLE training type correctly', async () => {
			const trainingId = 'bicycle-training-id';
			const participants = [
				{
					type: TrainingType.BICYCLE,
					userId: 'user-1',
					metrics: {
						timeSec: 600,
						avgSpeedMPerSec: 8.33,
						avgTempoSecondsPerKm: 120,
						distanceM: 10000,
						altitudeGainM: 200,
						kkcal: 800,
					},
				},
			];

			const mockAchievements = [
				{
					id: 'ach-bike',
					type: UserActivity.BICYCLE,
					measuringUnit: MeasuringUnit.KILOMETER,
					targetProgress: 50,
				},
			];

			const mockQueryChain = {
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				innerJoin: jest.fn().mockReturnThis(),
				then: jest.fn((resolve) => {
					resolve(participants);
				}),
			};

			const mockAchievementsQueryChain = {
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnValue(Promise.resolve(mockAchievements)),
			};

			databaseService.db.select = jest
				.fn()
				.mockReturnValueOnce(mockQueryChain)
				.mockReturnValueOnce(mockAchievementsQueryChain);

			(getActivityByTrainingType as jest.Mock).mockReturnValue(UserActivity.BICYCLE);

			await (service as any).handleTrainingFinished(trainingId);

			expect(mockAddProgress).toHaveBeenCalledTimes(1);
			expect(mockAddProgress).toHaveBeenCalledWith('user-1', 'ach-bike', 10); // 10000m / 1000 = 10km
		});

		it('should handle multiple participants', async () => {
			const trainingId = 'multi-participant-training';
			const participants = [
				{
					type: TrainingType.RUN,
					userId: 'user-1',
					metrics: {
						distanceM: 5000,
						timeSec: 120,
						avgSpeedMPerSec: 5.5,
						avgTempoSecondsPerKm: 300,
						altitudeGainM: 50,
						kkcal: 400,
					},
				},
				{
					type: TrainingType.RUN,
					userId: 'user-2',
					metrics: {
						distanceM: 10000,
						timeSec: 240,
						avgSpeedMPerSec: 5.5,
						avgTempoSecondsPerKm: 300,
						altitudeGainM: 100,
						kkcal: 800,
					},
				},
			];

			const mockAchievementsByType = {
				[UserActivity.RUN]: [
					{ id: 'ach-1', type: UserActivity.RUN, measuringUnit: MeasuringUnit.KILOMETER, targetProgress: 10 },
					{ id: 'ach-5', type: UserActivity.RUN, measuringUnit: MeasuringUnit.METER, targetProgress: 6000 },
				],
				[UserActivity.STEPS]: [
					{
						id: 'ach-2',
						type: UserActivity.STEPS,
						measuringUnit: MeasuringUnit.COUNT,
						targetProgress: 10000,
					},
				],
				[UserActivity.BICYCLE]: [
					{
						id: 'ach-3',
						type: UserActivity.BICYCLE,
						measuringUnit: MeasuringUnit.KILOMETER,
						targetProgress: 11,
					},
				],
				[UserActivity.TRACK]: [
					{
						id: 'ach-4',
						type: UserActivity.TRACK,
						measuringUnit: MeasuringUnit.KILOMETER,
						targetProgress: 12,
					},
				],
			};

			const mockQueryChain = {
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				innerJoin: jest.fn().mockReturnThis(),
				then: jest.fn((resolve) => {
					resolve(participants);
				}),
			};

			const getMockAchievementsQueryChain = (type: UserActivity) => ({
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				then: jest.fn((resolve) => {
					resolve(mockAchievementsByType[type]);
				}),
			});

			databaseService.db.select = jest
				.fn()
				.mockReturnValueOnce(mockQueryChain)
				.mockReturnValueOnce(getMockAchievementsQueryChain(UserActivity.STEPS))
				.mockReturnValueOnce(getMockAchievementsQueryChain(UserActivity.RUN));

			(getActivityByTrainingType as jest.Mock).mockReturnValue(UserActivity.RUN);

			await (service as any).handleTrainingFinished(trainingId);

			expect(mockAddProgress).toHaveBeenCalledTimes(3 * participants.length);

			for (const participant of participants) {
				const expectedDistanceKm = Math.trunc(participant.metrics.distanceM / 1000);
				const expectedStepsCount = Math.trunc(participant.metrics.distanceM / AVERAGE_STRIDE_LENGTH);

				expect(mockAddProgress).toHaveBeenCalledWith(participant.userId, 'ach-2', expectedStepsCount);
				expect(mockAddProgress).toHaveBeenCalledWith(participant.userId, 'ach-1', expectedDistanceKm);
				expect(mockAddProgress).toHaveBeenCalledWith(
					participant.userId,
					'ach-5',
					participant.metrics.distanceM,
				);
			}
		});

		it('should handle missing distanceM gracefully', async () => {
			const trainingId = 'no-distance-training';
			const participants = [
				{
					type: TrainingType.RUN,
					userId: 'user-1',
					metrics: {
						timeSec: 120,
						avgSpeedMPerSec: 5.5,
						avgTempoSecondsPerKm: 300,
						distanceM: null,
						altitudeGainM: 50,
						kkcal: 400,
					},
				},
			];

			const mockAchievementsByType = {
				[UserActivity.RUN]: [
					{ id: 'ach-1', type: UserActivity.RUN, measuringUnit: MeasuringUnit.KILOMETER, targetProgress: 10 },
					{ id: 'ach-5', type: UserActivity.RUN, measuringUnit: MeasuringUnit.METER, targetProgress: 6000 },
				],
				[UserActivity.STEPS]: [
					{
						id: 'ach-2',
						type: UserActivity.STEPS,
						measuringUnit: MeasuringUnit.COUNT,
						targetProgress: 10000,
					},
				],
				[UserActivity.BICYCLE]: [
					{
						id: 'ach-3',
						type: UserActivity.BICYCLE,
						measuringUnit: MeasuringUnit.KILOMETER,
						targetProgress: 11,
					},
				],
				[UserActivity.TRACK]: [
					{
						id: 'ach-4',
						type: UserActivity.TRACK,
						measuringUnit: MeasuringUnit.KILOMETER,
						targetProgress: 12,
					},
				],
			};

			const mockQueryChain = {
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				innerJoin: jest.fn().mockReturnThis(),
				then: jest.fn((resolve) => {
					resolve(participants);
				}),
			};

			const getMockAchievementsQueryChain = (type: UserActivity) => ({
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				then: jest.fn((resolve) => {
					resolve(mockAchievementsByType[type]);
				}),
			});

			databaseService.db.select = jest
				.fn()
				.mockReturnValueOnce(mockQueryChain)
				.mockReturnValueOnce(getMockAchievementsQueryChain(UserActivity.STEPS))
				.mockReturnValueOnce(getMockAchievementsQueryChain(UserActivity.RUN));

			(getActivityByTrainingType as jest.Mock).mockReturnValue(UserActivity.RUN);

			await (service as any).handleTrainingFinished(trainingId);

			expect(mockAddProgress).toHaveBeenCalledTimes(3);
			// If distanceM is falsy, Math.trunc(null) = 0, so progressToAdd = 0
			expect(mockAddProgress).toHaveBeenCalledWith('user-1', 'ach-2', 0);
			expect(mockAddProgress).toHaveBeenCalledWith('user-1', 'ach-1', 0);
			expect(mockAddProgress).toHaveBeenCalledWith('user-1', 'ach-5', 0);
		});

		it('should handle errors in addProgress without breaking the whole flow', async () => {
			const trainingId = 'error-handling-training';
			const participants = [
				{
					type: TrainingType.RUN,
					userId: 'user-1',
					metrics: {
						distanceM: 5000,
						timeSec: 120,
						avgSpeedMPerSec: 5.5,
						avgTempoSecondsPerKm: 300,
						altitudeGainM: 50,
						kkcal: 400,
					},
				},
			];

			const mockAchievementsByType = {
				[UserActivity.RUN]: [
					{ id: 'ach-1', type: UserActivity.RUN, measuringUnit: MeasuringUnit.KILOMETER, targetProgress: 10 },
					{ id: 'ach-5', type: UserActivity.RUN, measuringUnit: MeasuringUnit.METER, targetProgress: 6000 },
				],
				[UserActivity.STEPS]: [
					{
						id: 'ach-2',
						type: UserActivity.STEPS,
						measuringUnit: MeasuringUnit.COUNT,
						targetProgress: 10000,
					},
				],
				[UserActivity.BICYCLE]: [
					{
						id: 'ach-3',
						type: UserActivity.BICYCLE,
						measuringUnit: MeasuringUnit.KILOMETER,
						targetProgress: 11,
					},
				],
				[UserActivity.TRACK]: [
					{
						id: 'ach-4',
						type: UserActivity.TRACK,
						measuringUnit: MeasuringUnit.KILOMETER,
						targetProgress: 12,
					},
				],
			};

			const mockQueryChain = {
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				innerJoin: jest.fn().mockReturnThis(),
				then: jest.fn((resolve) => {
					resolve(participants);
				}),
			};

			const getMockAchievementsQueryChain = (type: UserActivity) => ({
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				then: jest.fn((resolve) => {
					resolve(mockAchievementsByType[type]);
				}),
			});

			databaseService.db.select = jest
				.fn()
				.mockReturnValueOnce(mockQueryChain)
				.mockReturnValueOnce(getMockAchievementsQueryChain(UserActivity.STEPS))
				.mockReturnValueOnce(getMockAchievementsQueryChain(UserActivity.RUN));

			(getActivityByTrainingType as jest.Mock).mockReturnValue(UserActivity.RUN);

			// Make addProgress fail for user-1
			(mockAddProgress as jest.Mock)
				.mockRejectedValueOnce(new Error('DB error'))
				.mockResolvedValueOnce({ success: true });

			// Should not throw
			await expect((service as any).handleTrainingFinished(trainingId)).resolves.not.toThrow();

			const expectedDistanceKm = Math.trunc(participants[0].metrics.distanceM / 1000);
			const expectedStepsCount = Math.trunc(participants[0].metrics.distanceM / AVERAGE_STRIDE_LENGTH);

			expect(mockAddProgress).toHaveBeenCalledTimes(3);
			expect(mockAddProgress).toHaveBeenCalledWith('user-1', 'ach-2', expectedStepsCount); // 5000m / AVERAGE_STRIDE_LENGTH
			expect(mockAddProgress).toHaveBeenCalledWith('user-1', 'ach-1', expectedDistanceKm); // 5000m / 1000 = 5km
			expect(mockAddProgress).toHaveBeenCalledWith('user-1', 'ach-5', participants[0].metrics.distanceM); // 5000m
		});
	});
});
