import { Controller, Post, Query } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Controller('mailer')
export class MailerController {
	constructor(private readonly service: MailerService) {}

	// @TODO убрать дебаг-роут
	/**
	 * @tag Mailer
	 * @summary DEBUG Отправить письмо восстановления пароля
	 */
	@Post('send-recovery-mail')
	public sendRecoveryMail(@Query('to') to: string) {
		return this.service.sendPasswordRecoveryMail(to);
	}
}
