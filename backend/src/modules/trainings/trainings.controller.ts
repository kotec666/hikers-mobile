import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { TrainingDto, TrainingParticipantDto } from './trainings.dto';
import { User } from '@decorators/user.decorator';
import { TokenDto } from '../token/token.dto';
import { UserInterceptor } from '../../common/interceptors/user.interceptor';
import { CommonDto } from '../../common/dto/common.dto';
import { IsUUID, ParseEnumArray } from '@validation/parameter-decorators';
import { NotNegative } from '@validation/query-decorators';
import { TrainingType } from '@shared/enums';

@Controller('trainings')
@UseInterceptors(UserInterceptor)
export class TrainingsController {
	constructor(private readonly service: TrainingsService) {}

	/**
	 * @tag Trainings
	 * @summary ДЕБАГ-РУДИМЕНТ ДЛЯ ФРОНТЕНДА. НЕ ИСПОЛЬЗОВАТЬ
	 * @security token
	 */
	@Get('history')
	public async getAll(@User() user: TokenDto.Payload): Promise<TrainingDto.Entity[]> {
		// @TODO выпилить когда не нужен будет
		return this.service.getAll(user.id);
	}

	/**
	 * @tag Trainings
	 * @summary (экран История тренировок) Получить тренировки, где пользователь участник
	 * @security token
	 */
	@Get('my')
	public async getMy(
		@User() user: TokenDto.Payload,
		@NotNegative('page') @Query('page') page: number,
		@NotNegative('limit') @Query('limit') limit: number,
		@Query('finished') isFinished?: boolean,
		@ParseEnumArray({ key: 'types', enum: TrainingType }) @Query('types') types?: TrainingType[],
	): Promise<TrainingDto.HistoryEntity[]> {
		return this.service.getMy(user.id, page, limit, isFinished, types);
	}

	/**
	 * @tag Trainings
	 * @summary Получить детали тренировки по id
	 * @security token
	 */
	@Get('extended/:id')
	public async getExtendedById(
		@User() user: TokenDto.Payload,
		@IsUUID('id') @Param('id') id: string,
	): Promise<TrainingDto.ExtendedEntity> {
		return this.service.getExtendedByIdAndParticipant(id, user.id);
	}

	/**
	 * @tag Trainings
	 * @summary Получить тренировку по id
	 * @security token
	 */
	@Get(':id')
	public async getById(
		@User() user: TokenDto.Payload,
		@IsUUID('id') @Param('id') id: string,
	): Promise<TrainingDto.Entity> {
		return this.service.getByIdAndParticipant(id, user.id);
	}

	/**
	 * @tag Trainings
	 * @summary Начать тренировку
	 * @security token
	 */
	@Post('start')
	public async start(@User() user: TokenDto.Payload, @Body() dto: TrainingDto.Start): Promise<TrainingDto.Entity> {
		return this.service.start(user.id, dto);
	}

	/**
	 * @tag Trainings
	 * @summary Завершить тренировку
	 * @security token
	 */
	@Post('finish')
	public async finish(
		@User() user: TokenDto.Payload,
		@Body() dto?: TrainingDto.Finish,
	): Promise<CommonDto.BooleanResponse> {
		return this.service.finish(user.id, dto?.ts);
	}

	/**
	 * @tag Trainings
	 * @summary Передать метрики по тренировке (можно частями)
	 * @security token
	 */
	@Patch('sync/:id')
	public async sync(
		@User() user: TokenDto.Payload,
		@IsUUID('id') @Param('id') id: string,
		@Body() dto: TrainingDto.Sync,
	): Promise<CommonDto.BooleanResponse> {
		return this.service.sync(user.id, id, dto);
	}

	/**
	 * @tag Trainings
	 * @summary Добавить инфу по оффлайн трене (метрики через /sync как обычно)
	 * @security token
	 */
	@Post('offline')
	public async addOffline(
		@User() user: TokenDto.Payload,
		@Body() dto: TrainingDto.Offline,
	): Promise<TrainingDto.Entity> {
		return this.service.addOffline(user.id, dto);
	}

	/**
	 * @tag Trainings
	 * @summary Посчитать финальные метрики по тренировке
	 * @security token
	 */
	@Patch('calc-metrics/:id')
	public async calcMetrics(
		@User() user: TokenDto.Payload,
		@IsUUID('id') @Param('id') id: string,
	): Promise<CommonDto.BooleanResponse> {
		return this.service.requestCalcMetrics(user.id, id);
	}

	/**
	 * @tag Trainings
	 * @summary Удалить незавершенные тренировки (не будут отображены в истории тренировок)
	 * @security token
	 */
	@Delete('delete-not-finished')
	public async deleteAllNotFinished(@User() user: TokenDto.Payload): Promise<CommonDto.BooleanResponse> {
		return this.service.deleteAllNotFinished(user.id);
	}

	/**
	 * @tag Trainings
	 * @summary Удалить незавершенную тренировку по id
	 * @security token
	 */
	@Delete('delete-not-finished/:id')
	public async deleteNotFinishedById(
		@User() user: TokenDto.Payload,
		@Param('id') id: string,
	): Promise<CommonDto.BooleanResponse> {
		return this.service.deleteNotFinishedById(user.id, id);
	}

	/**
	 * @tag Trainings
	 * @summary Получить участников тренировки по id тренировки с пагинацией
	 * @security token
	 */
	@Get(':id/participants')
	public async getParticipants(
		@User() user: TokenDto.Payload,
		@IsUUID('id') @Param('id') id: string,
		@NotNegative('page') @Query('page') page: number,
		@NotNegative('limit') @Query('limit') limit: number,
	): Promise<Required<TrainingParticipantDto.Entity>[]> {
		return this.service.getParticipantsWithSubs(user.id, id, page, limit);
	}
}
