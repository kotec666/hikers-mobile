import { Body, Controller, Delete, Param, Patch, Post, UseInterceptors } from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { TrainingDto } from './trainings.dto';
import { User } from 'src/common/decorators/user.decorator';
import { TokenDto } from '../token/token.dto';
import { UserInterceptor } from 'src/common/interceptors/user.interceptor';
import { CommonDto } from 'src/common/dto/common.dto';
import { IsUUID } from '@validation/uuid.validatior';

@Controller('trainings')
@UseInterceptors(UserInterceptor)
export class TrainingsController {
	constructor(private readonly service: TrainingsService) {}

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
	public async finish(@User() user: TokenDto.Payload): Promise<CommonDto.BooleanResponse> {
		return this.service.finish(user.id);
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
	 * @summary Удалить незавершенную тренировку (не будет отображена в истории тренировок)
	 * @security token
	 */
	@Delete('delete-not-finished')
	public async deleteAllNotFinished(@User() user: TokenDto.Payload): Promise<CommonDto.BooleanResponse> {
		return this.service.deleteAllNotFinished(user.id);
	}
}
