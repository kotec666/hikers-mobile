import { MailerService as Mailer } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { EMAIL_CONFIRMATION_CODE_TTL_MS } from '@shared/constants';

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

	public async sendEmailConfirmationMail(to: string, code: number | string) {
		const subject = `Заголовок ${Date.now()}`;

		return this.mailer.sendMail({
			template: 'confirmEmail',
			context: {
				code,
				ttlMins: (EMAIL_CONFIRMATION_CODE_TTL_MS / 1000 / 60).toFixed(0),
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
