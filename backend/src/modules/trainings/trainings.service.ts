import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { training, trainingParticipants } from '../database/schema';
import { TrainingDto } from './trainings.dto';
import { eq, and, isNull, isNotNull } from 'drizzle-orm';
import { ERRORS } from '@shared/errors';

@Injectable()
export class TrainingsService {
	private readonly trainingsOnPause = new Set<string>();

	constructor(private readonly db: DatabaseService) {
		// @TODO интервал на чистку пустых тренировок
		// @TODO восстановление тренировок на паузе из бд
	}

	public async start(userId: string, dto: TrainingDto.Start): Promise<TrainingDto.Entity> {
		const activeTrainings = await this.getActive(userId, false);
		if (activeTrainings.length > 0) {
			throw new BadRequestException(ERRORS.ALREADY_CREATED);
		}

		const upsertQuery = {
			type: dto.type,
			userCreatorId: userId,
			startedAt: dto.now ? new Date() : undefined,
		};
		const returningQuery = {
			id: training.id,
			type: training.type,
			createdAt: training.createdAt,
			startedAt: training.startedAt,
			finishedAt: training.finishedAt,
		};

		// Созданная тренировка может быть только в единственном экземпляре. Обновляем её
		// Нужно для случая, когда сначала были разосланы инвайты, а потом юзер начал саму треню
		const createdTrainings = await this.getCreated(userId, false);
		const createdTraining = createdTrainings.length > 0 ? createdTrainings[0] : null;

		// Обновляем существующюю или создаем новую
		// (просто удалить существующюю нельзя - т.к. на ней могут висеть инвайты)
		const [trainingRow] = createdTraining
			? await this.db.db
					.update(training)
					.set(upsertQuery)
					.where(eq(training.id, createdTraining.id))
					.returning(returningQuery)
			: await this.db.db.insert(training).values(upsertQuery).returning(returningQuery);

		return trainingRow;

		// @TODO асинхронно, без ожидания
		// создать записи под метрики трени, роуты для всех участников
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async pause(userId: string, id: string): Promise<any> {
		this.trainingsOnPause.add(id);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async sync(userId: string, id: string): Promise<any> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const onPause = this.trainingsOnPause.has(id);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async finish(userId: string, id: string): Promise<any> {
		this.trainingsOnPause.delete(id);
	}

	public async getFinished(userId: string, isCreator: boolean): Promise<any> {
		return this.getByStatus(userId, isCreator, 'finished');
	}

	public async getActive(userId: string, isCreator: boolean): Promise<TrainingDto.Entity[]> {
		return this.getByStatus(userId, isCreator, 'started');
	}

	public async getCreated(userId: string, isCreator: boolean): Promise<TrainingDto.Entity[]> {
		return this.getByStatus(userId, isCreator, 'created');
	}

	/** Получить все тренировки юзера по статусу. Никогда не выкидывает ошибку - только пустой массив */
	private async getByStatus(
		userId: string,
		isCreator: boolean,
		status: 'created' | 'started' | 'finished',
	): Promise<TrainingDto.Entity[]> {
		let startedAtFunc = isNull.bind(this);
		let finishedAtFunc = isNull.bind(this);

		switch (status) {
			case 'created': {
				startedAtFunc = isNull.bind(this);
				finishedAtFunc = isNull.bind(this);
				break;
			}
			case 'started': {
				startedAtFunc = isNotNull.bind(this);
				finishedAtFunc = isNull.bind(this);
				break;
			}
			case 'finished': {
				startedAtFunc = isNotNull.bind(this);
				finishedAtFunc = isNotNull.bind(this);
				break;
			}

			default:
				throw new Error('Bad status provided');
		}

		const query = this.db.db
			.select({
				id: training.id,
				type: training.type,
				createdAt: training.createdAt,
				startedAt: training.startedAt,
				finishedAt: training.finishedAt,
			})
			.from(training);

		if (isCreator) {
			query.where(
				and(
					startedAtFunc(training.startedAt),
					finishedAtFunc(training.finishedAt),
					eq(training.userCreatorId, userId),
				),
			);
		} else {
			query.leftJoin(trainingParticipants, eq(trainingParticipants.trainingId, training.id));
			query.where(
				and(
					startedAtFunc(training.startedAt),
					finishedAtFunc(training.finishedAt),
					eq(trainingParticipants.userId, userId),
				),
			);
		}

		return await query;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async getById(id: string): Promise<any> {}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async getExtendedById(id: string): Promise<any> {}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async sendInvite(userCreatorId: string, toUserId: string): Promise<any> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [trainingRow] = await this.db.db
			.select({
				id: training.id,
				createdAt: training.createdAt,
				startedAt: training.startedAt,
				finishedAt: training.finishedAt,
			})
			.from(training)
			.where(eq(training.userCreatorId, userCreatorId))
			.limit(1);
		// @TODO создавать треню если нету, проверять на наличие активной везде и тут!
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async leave(userParticipantId: string): Promise<any> {}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async kickParticipant(userCreatorId: string, userParticipantId: string): Promise<any> {}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async revokeInvite(userCreatorId: string, toUserId: string): Promise<any> {}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async acceptInvite(invitedUserId: string, userCreatorId: string): Promise<any> {
		// @TODO асинхронно, без ожидания
		// создать запись под метрики трени, роуты
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async revectInvite(invitedUserId: string, userCreatorId: string): Promise<any> {}
}
