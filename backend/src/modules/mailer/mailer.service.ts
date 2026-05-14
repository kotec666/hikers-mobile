import { MailerService as Mailer } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailerService {
	constructor(private readonly mailer: Mailer) {}

	public async sendMail(to: string, subject: string, text: string) {
		return this.mailer.sendMail({
			to,
			subject,
			text,
		});
	}

	public async sendPasswordRecoveryMail(to: string) {
		const text = 'Забыл парол? Шя восстановим';
		const subject = `Заголовок ${Date.now()}`;

		return this.mailer.sendMail({
			template: 'passwordRecovery',
			context: {
				code: '123',
			},
			to,
			subject,
			text,
		});
	}
}
