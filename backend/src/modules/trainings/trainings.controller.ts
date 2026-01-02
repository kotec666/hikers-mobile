import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { TrainingDto } from './trainings.dto';
import { User } from 'src/common/decorators/user.decorator';
import { TokenDto } from '../token/token.dto';
import { UserInterceptor } from 'src/common/interceptors/user.interceptor';
import { CommonDto } from 'src/common/dto/common.dto';
import { IsUUID } from '@validation/uuid.validatior';
import { TrainingType } from '@shared/enums';
import { ParseEnumArray } from '@validation/param.decorators';

@Controller('trainings')
@UseInterceptors(UserInterceptor)
export class TrainingsController {
	constructor(private readonly service: TrainingsService) {}

	/**
	 * @tag Trainings
	 * @summary История тренировок (завершённые, где пользователь был участником)
	 * @security token
	 */
	@Get('history')
	public async getHistory(
		@User() user: TokenDto.Payload,
		@ParseEnumArray({ key: 'types', enum: TrainingType }) @Query('types') types?: TrainingType[],
	): Promise<TrainingDto.Entity[]> {
		return this.service.getHistory(user.id, types);
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
		@Body() dto: TrainingDto.Finish,
	): Promise<CommonDto.BooleanResponse> {
		return this.service.finish(user.id, dto);
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
	 * @summary Удалить незавершенные тренировки (не будут отображены в истории тренировок)
	 * @security token
	 */
	@Delete('delete-not-finished')
	public async deleteAllNotFinished(@User() user: TokenDto.Payload): Promise<CommonDto.BooleanResponse> {
		return this.service.deleteAllNotFinished(user.id);
	}
}
