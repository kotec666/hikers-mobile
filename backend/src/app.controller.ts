import { Controller, Get, HttpStatus, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(private readonly service: AppService) {}

	@Get('generate_204')
	public generateNoContent(@Res() res: Response) {
		res.status(HttpStatus.NO_CONTENT).send();
	}

	@Post('send-recovery-mail')
	public sendRecoveryMail(@Query('to') to: string) {
		return this.service.sendPasswordRecoveryMail(to);
	}
}
