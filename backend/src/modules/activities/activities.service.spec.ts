import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesService } from './activities.service';
import { DatabaseService } from '../database/database.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MeasuringUnit, TrainingType, UserActivity } from '@shared/enums';
import { AVERAGE_STRIDE_LENGTH } from '@shared/constants';
import { getActivityByTrainingType, getDefaultMeasuringUnitByActivity } from './helpers';

// Mock the helpers
jest.mock('./helpers', () => ({
	getActivityByTrainingType: jest.fn(),
	getDefaultMeasuringUnitByActivity: jest.fn(),
}));

describe('ActivitiesService - handleTrainingFinished', () => {
	let service: ActivitiesService;
	let databaseService: DatabaseService;

	const mockAddGoalProgress = jest.fn();

	beforeEach(async () => {
		jest.clearAllMocks();
		(mockAddGoalProgress as jest.Mock).mockResolvedValue({ success: true });

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ActivitiesService,
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
							onConflictDoNothing: jest.fn(),
							returning: jest.fn(),
							transaction: jest.fn(),
						},
					},
				},
				{
					provide: EventEmitter2,
					useValue: {
						emit: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<ActivitiesService>(ActivitiesService);
		databaseService = module.get<DatabaseService>(DatabaseService);

		// Mock private method that is called internally
		(service as any).addGoalProgress = mockAddGoalProgress;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('handleTrainingFinished', () => {
		it('should process participants and update activities for RUN training', async () => {
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

			const mockQueryChain = {
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				innerJoin: jest.fn().mockReturnThis(),
				then: jest.fn((resolve) => {
					resolve(participants);
				}),
			};

			databaseService.db.select = jest.fn().mockReturnValue(mockQueryChain);
			(getActivityByTrainingType as jest.Mock).mockReturnValue(UserActivity.RUN);
			(getDefaultMeasuringUnitByActivity as jest.Mock).mockReturnValueOnce(MeasuringUnit.COUNT); // для шагов
			(getDefaultMeasuringUnitByActivity as jest.Mock).mockReturnValueOnce(MeasuringUnit.KILOMETER); // для дистанции

			await (service as any).handleTrainingFinished(trainingId);

			expect(mockAddGoalProgress).toHaveBeenCalledTimes(2);

			const expectedSteps = Math.trunc(participants[0].metrics.distanceM / AVERAGE_STRIDE_LENGTH);
			const expectedDistanceKm = Math.trunc(participants[0].metrics.distanceM / 1000);
			expect(mockAddGoalProgress).toHaveBeenCalledWith('user-1', UserActivity.RUN, expectedDistanceKm); // 5000m / 1000 = 5km
			expect(mockAddGoalProgress).toHaveBeenCalledWith('user-1', UserActivity.STEPS, expectedSteps);
		});

		it('should handle WALK training type correctly (adds STEPS and TRACK activities)', async () => {
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

			const mockQueryChain = {
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				innerJoin: jest.fn().mockReturnThis(),
				then: jest.fn((resolve) => {
					resolve(participants);
				}),
			};

			databaseService.db.select = jest.fn().mockReturnValue(mockQueryChain);
			(getActivityByTrainingType as jest.Mock).mockReturnValue(null);
			(getDefaultMeasuringUnitByActivity as jest.Mock).mockReturnValueOnce(MeasuringUnit.COUNT); // для шагов
			(getDefaultMeasuringUnitByActivity as jest.Mock).mockReturnValueOnce(MeasuringUnit.KILOMETER); // для дистанции

			await (service as any).handleTrainingFinished(trainingId);

			expect(mockAddGoalProgress).toHaveBeenCalledTimes(2);

			const expectedSteps = Math.trunc(participants[0].metrics.distanceM / AVERAGE_STRIDE_LENGTH);
			const expectedDistanceKm = Math.trunc(participants[0].metrics.distanceM / 1000);
			expect(mockAddGoalProgress).toHaveBeenCalledWith('user-1', UserActivity.STEPS, expectedSteps);
			expect(mockAddGoalProgress).toHaveBeenCalledWith('user-1', UserActivity.TRACK, expectedDistanceKm);
		});

		it('should handle TRACK training type correctly', async () => {
			const trainingId = 'track-training-id';
			const participants = [
				{
					type: TrainingType.TRACK,
					userId: 'user-1',
					metrics: {
						timeSec: 300,
						avgSpeedMPerSec: 6.0,
						avgTempoSecondsPerKm: 167,
						distanceM: 7500,
						altitudeGainM: 80,
						kkcal: 600,
					},
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

			databaseService.db.select = jest.fn().mockReturnValue(mockQueryChain);
			(getActivityByTrainingType as jest.Mock).mockReturnValue(UserActivity.TRACK);
			(getDefaultMeasuringUnitByActivity as jest.Mock).mockReturnValueOnce(MeasuringUnit.COUNT); // для шагов
			(getDefaultMeasuringUnitByActivity as jest.Mock).mockReturnValueOnce(MeasuringUnit.KILOMETER); // для дистанции

			await (service as any).handleTrainingFinished(trainingId);

			expect(mockAddGoalProgress).toHaveBeenCalledTimes(2);

			const expectedSteps = Math.trunc(participants[0].metrics.distanceM / AVERAGE_STRIDE_LENGTH);
			const expectedDistanceKm = Math.trunc(participants[0].metrics.distanceM / 1000);
			expect(mockAddGoalProgress).toHaveBeenCalledWith('user-1', UserActivity.STEPS, expectedSteps);
			expect(mockAddGoalProgress).toHaveBeenCalledWith('user-1', UserActivity.TRACK, expectedDistanceKm);
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

			const mockQueryChain = {
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				innerJoin: jest.fn().mockReturnThis(),
				then: jest.fn((resolve) => {
					resolve(participants);
				}),
			};

			databaseService.db.select = jest.fn().mockReturnValue(mockQueryChain);
			(getActivityByTrainingType as jest.Mock).mockReturnValue(UserActivity.BICYCLE);
			(getDefaultMeasuringUnitByActivity as jest.Mock).mockReturnValue(MeasuringUnit.KILOMETER);

			await (service as any).handleTrainingFinished(trainingId);

			expect(mockAddGoalProgress).toHaveBeenCalledTimes(1);

			expect(mockAddGoalProgress).toHaveBeenCalledWith('user-1', UserActivity.BICYCLE, 10); // 10000m / 1000 = 10km
			// BICYCLE doesn't add STEPS activity
			expect(mockAddGoalProgress).not.toHaveBeenCalledWith('user-1', UserActivity.STEPS, expect.any(Number));
		});

		it('should handle METER measuring unit correctly', async () => {
			const trainingId = 'meter-unit-training-id';
			const participants = [
				{
					type: TrainingType.RUN,
					userId: 'user-1',
					metrics: {
						timeSec: 120,
						avgSpeedMPerSec: 5.5,
						avgTempoSecondsPerKm: 300,
						distanceM: 1234,
						altitudeGainM: 50,
						kkcal: 400,
					},
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

			databaseService.db.select = jest.fn().mockReturnValue(mockQueryChain);
			(getActivityByTrainingType as jest.Mock).mockReturnValue(UserActivity.RUN);
			(getDefaultMeasuringUnitByActivity as jest.Mock).mockReturnValueOnce(MeasuringUnit.COUNT); // для шагов
			(getDefaultMeasuringUnitByActivity as jest.Mock).mockReturnValueOnce(MeasuringUnit.METER); // для дистанции

			await (service as any).handleTrainingFinished(trainingId);

			expect(mockAddGoalProgress).toHaveBeenCalledTimes(2);

			const expectedSteps = Math.trunc(participants[0].metrics.distanceM / AVERAGE_STRIDE_LENGTH);
			const expectedDistanceM = participants[0].metrics.distanceM;
			expect(mockAddGoalProgress).toHaveBeenCalledWith('user-1', UserActivity.RUN, expectedDistanceM);
			expect(mockAddGoalProgress).toHaveBeenCalledWith('user-1', UserActivity.STEPS, expectedSteps);
		});

		it('should skip activity when getActivityByTrainingType returns null', async () => {
			const trainingId = 'unknown-training-id';
			const participants = [
				{
					type: 'UNKNOWN' as TrainingType,
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

			const mockQueryChain = {
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				innerJoin: jest.fn().mockReturnThis(),
				then: jest.fn((resolve) => {
					resolve(participants);
					return Promise.resolve(participants);
				}),
			};

			databaseService.db.select = jest.fn().mockReturnValue(mockQueryChain);
			(getActivityByTrainingType as jest.Mock).mockReturnValue(null);

			await (service as any).handleTrainingFinished(trainingId);

			// Only STEPS might be added depending on training type, but main activity is skipped
			expect(mockAddGoalProgress).toHaveBeenCalledTimes(0);
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
				{
					type: TrainingType.RUN,
					userId: 'user-3',
					metrics: {
						distanceM: 2500,
						timeSec: 60,
						avgSpeedMPerSec: 5.5,
						avgTempoSecondsPerKm: 300,
						altitudeGainM: 25,
						kkcal: 200,
					},
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

			databaseService.db.select = jest.fn().mockReturnValue(mockQueryChain);
			(getActivityByTrainingType as jest.Mock).mockReturnValue(UserActivity.RUN);
			(getDefaultMeasuringUnitByActivity as jest.Mock).mockReturnValueOnce(MeasuringUnit.COUNT); // для шагов
			(getDefaultMeasuringUnitByActivity as jest.Mock).mockReturnValueOnce(MeasuringUnit.KILOMETER); // для дистанции
			(getDefaultMeasuringUnitByActivity as jest.Mock).mockReturnValueOnce(MeasuringUnit.COUNT); // для шагов
			(getDefaultMeasuringUnitByActivity as jest.Mock).mockReturnValueOnce(MeasuringUnit.KILOMETER); // для дистанции
			(getDefaultMeasuringUnitByActivity as jest.Mock).mockReturnValueOnce(MeasuringUnit.COUNT); // для шагов
			(getDefaultMeasuringUnitByActivity as jest.Mock).mockReturnValueOnce(MeasuringUnit.KILOMETER); // для дистанции

			await (service as any).handleTrainingFinished(trainingId);

			expect(mockAddGoalProgress).toHaveBeenCalledTimes(6); // 3 users * 2 activities (RUN + STEPS)

			for (const participant of participants) {
				expect(mockAddGoalProgress).toHaveBeenCalledWith(
					participant.userId,
					UserActivity.STEPS,
					Math.trunc(participant.metrics.distanceM / AVERAGE_STRIDE_LENGTH),
				);
				expect(mockAddGoalProgress).toHaveBeenCalledWith(
					participant.userId,
					UserActivity.RUN,
					Math.trunc(participant.metrics.distanceM / 1000),
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

			const mockQueryChain = {
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				innerJoin: jest.fn().mockReturnThis(),
				then: jest.fn((resolve) => {
					resolve(participants);
				}),
			};

			databaseService.db.select = jest.fn().mockReturnValue(mockQueryChain);
			(getActivityByTrainingType as jest.Mock).mockReturnValue(UserActivity.RUN);
			(getDefaultMeasuringUnitByActivity as jest.Mock).mockReturnValue(MeasuringUnit.KILOMETER);

			await (service as any).handleTrainingFinished(trainingId);

			// If distanceM is null, Math.trunc(null) = 0, so goalToAdd = 0
			// The method will still call addGoalProgress with 0, which will be handled there
			expect(mockAddGoalProgress).toHaveBeenCalledWith('user-1', UserActivity.RUN, 0);
		});

		it('should return early when no participants found', async () => {
			const trainingId = 'no-participants-training';
			const emptyParticipants: any[] = [];

			const mockQueryChain = {
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				innerJoin: jest.fn().mockReturnThis(),
				then: jest.fn((resolve) => {
					resolve(emptyParticipants);
				}),
			};

			databaseService.db.select = jest.fn().mockReturnValue(mockQueryChain);

			await (service as any).handleTrainingFinished(trainingId);

			expect(databaseService.db.select).toHaveBeenCalled();
			expect(mockAddGoalProgress).not.toHaveBeenCalled();
		});

		it('should add STEPS activity for RUN, TRACK, and WALK training types', async () => {
			const trainingId = 'steps-test-training';
			const testCases = [
				{ type: TrainingType.RUN, shouldAddSteps: true },
				{ type: TrainingType.TRACK, shouldAddSteps: true },
				{ type: TrainingType.WALK, shouldAddSteps: true },
				{ type: TrainingType.BICYCLE, shouldAddSteps: false },
			];

			for (const testCase of testCases) {
				jest.clearAllMocks();

				const participants = [
					{
						type: testCase.type,
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

				const mockQueryChain = {
					select: jest.fn().mockReturnThis(),
					from: jest.fn().mockReturnThis(),
					where: jest.fn().mockReturnThis(),
					innerJoin: jest.fn().mockReturnThis(),
					then: jest.fn((resolve) => {
						resolve(participants);
					}),
				};

				databaseService.db.select = jest.fn().mockReturnValue(mockQueryChain);
				(getActivityByTrainingType as jest.Mock).mockReturnValue(
					testCase.type === TrainingType.BICYCLE ? UserActivity.BICYCLE : null,
				);
				(getDefaultMeasuringUnitByActivity as jest.Mock).mockReturnValue(MeasuringUnit.KILOMETER);

				await (service as any).handleTrainingFinished(trainingId);

				if (testCase.shouldAddSteps) {
					expect(mockAddGoalProgress).toHaveBeenCalledWith('user-1', UserActivity.STEPS, expect.any(Number));
				} else {
					expect(mockAddGoalProgress).not.toHaveBeenCalledWith(
						'user-1',
						UserActivity.STEPS,
						expect.any(Number),
					);
				}
			}
		});

		it('should add TRACK activity for WALK training type', async () => {
			const trainingId = 'walk-track-test';
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

			const mockQueryChain = {
				select: jest.fn().mockReturnThis(),
				from: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				innerJoin: jest.fn().mockReturnThis(),
				then: jest.fn((resolve) => {
					resolve(participants);
				}),
			};

			databaseService.db.select = jest.fn().mockReturnValue(mockQueryChain);
			(getActivityByTrainingType as jest.Mock).mockReturnValue(null);
			(getDefaultMeasuringUnitByActivity as jest.Mock).mockReturnValue(MeasuringUnit.KILOMETER);

			await (service as any).handleTrainingFinished(trainingId);

			// WALK should add both STEPS and TRACK
			expect(mockAddGoalProgress).toHaveBeenCalledWith('user-1', UserActivity.TRACK, 1);
			expect(mockAddGoalProgress).toHaveBeenCalledWith('user-1', UserActivity.STEPS, expect.any(Number));
		});

		it('should handle zero distance correctly', async () => {
			const trainingId = 'zero-distance-training';
			const participants = [
				{
					type: TrainingType.RUN,
					userId: 'user-1',
					metrics: {
						timeSec: 0,
						avgSpeedMPerSec: 0,
						avgTempoSecondsPerKm: 0,
						distanceM: 0,
						altitudeGainM: 0,
						kkcal: 0,
					},
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

			databaseService.db.select = jest.fn().mockReturnValue(mockQueryChain);
			(getActivityByTrainingType as jest.Mock).mockReturnValue(UserActivity.RUN);
			(getDefaultMeasuringUnitByActivity as jest.Mock).mockReturnValueOnce(MeasuringUnit.COUNT); // для шагов
			(getDefaultMeasuringUnitByActivity as jest.Mock).mockReturnValueOnce(MeasuringUnit.KILOMETER); // для дистанции

			await (service as any).handleTrainingFinished(trainingId);

			expect(mockAddGoalProgress).toHaveBeenCalledWith('user-1', UserActivity.RUN, 0);
			expect(mockAddGoalProgress).toHaveBeenCalledWith('user-1', UserActivity.STEPS, 0);
		});
	});
});
