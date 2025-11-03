import { Controller, Post } from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { TrainingDto } from './trainings.dto';
import { User } from 'src/common/decorators/user.decorator';
import { TokenDto } from '../token/token.dto';

@Controller('trainings')
export class TrainingsController {
	constructor(private readonly service: TrainingsService) {}

	@Post('start')
	public async start(@User() user: TokenDto.Payload, dto: TrainingDto.Start): Promise<TrainingDto.Entity> {
		return this.service.start(user.id, dto);
	}
}
