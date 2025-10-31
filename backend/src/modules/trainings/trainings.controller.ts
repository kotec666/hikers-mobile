import { Controller } from '@nestjs/common';
import { TrainingsService } from './trainings.service';

@Controller('trainings')
export class TrainingsController {
	constructor(private readonly service: TrainingsService) {}
}
