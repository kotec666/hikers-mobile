import { Controller, Delete, Patch, Post } from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { TrainingDto } from './trainings.dto';
import { User } from 'src/common/decorators/user.decorator';
import { TokenDto } from '../token/token.dto';

@Controller('trainings')
export class TrainingsController {
	constructor(private readonly service: TrainingsService) {}

	/**
	 * @tag Trainings
	 * @summary Начать тренировку
	 * @security token
	 */
	@Post('start')
	public async start(@User() user: TokenDto.Payload, dto: TrainingDto.Start): Promise<TrainingDto.Entity> {
		return this.service.start(user.id, dto);
	}

	/**
	 * @tag Trainings
	 * @summary Передать метрики по тренировке (можно частями)
	 * @security token
	 */
	@Patch('sync')
	public async sync(@User() user: TokenDto.Payload, dto: TrainingDto.Sync): Promise<void> {
		return this.service.sync(user.id, dto);
	}

	/**
	 * @tag Trainings
	 * @summary Удалить незавершенную тренировку (не будет отображена в истории тренировок)
	 * @security token
	 */
	@Delete('delete-not-finished')
	public async deleteAllNotFinished(@User() user: TokenDto.Payload): Promise<TrainingDto.Entity> {
		return this.service.deleteAllNotFinished(user.id);
	}
}
