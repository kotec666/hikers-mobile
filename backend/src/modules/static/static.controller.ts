import { Controller, Get, Param, Res } from '@nestjs/common';
import { StaticService } from './static.service';

@Controller('static')
export class StaticController {
	constructor(private readonly service: StaticService) {}

	/**
	 * @tag Static
	 * @summary Получить файл по его ключу
	 */
	@Get(':key')
	async serveStatic(@Param('key') key: string, @Res() res) {
		const file = await this.service.getFile(key);
		return file.pipe(res);
	}
}
