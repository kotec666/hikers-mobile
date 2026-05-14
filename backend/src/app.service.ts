import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	constructor(private readonly mailService: MailerService) {}

	public async sendMail(to: string, subject: string, text: string) {
		return this.mailService.sendMail({
			to,
			subject,
			text,
		});
	}

	public async sendPasswordRecoveryMail(to: string) {
		const text = 'Забыл парол? Шя восстановим';
		const subject = 'Заголовок';

		return this.sendMail(to, subject, text);
	}
}
