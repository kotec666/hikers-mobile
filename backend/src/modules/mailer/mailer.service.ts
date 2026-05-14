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

	public async sendEmailConfirmationMail(to: string, code: number) {
		const subject = `Заголовок ${Date.now()}`;

		return this.mailer.sendMail({
			template: 'confirmEmail',
			context: {
				code,
			},
			to,
			subject,
		});
	}

	public async sendPasswordRecoveryMail(to: string) {
		const subject = `Заголовок ${Date.now()}`;

		return this.mailer.sendMail({
			template: 'passwordRecovery',
			context: {
				code: '123',
			},
			to,
			subject,
		});
	}
}
