import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class AppController {
	@Get('generate_204')
	public generateNoContent(@Res() res: Response) {
		res.status(HttpStatus.NO_CONTENT).send();
	}
}
