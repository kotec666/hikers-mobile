import { MailerService as Mailer } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { EMAIL_CONFIRMATION_CODE_TTL_MS, PASSWORD_RECOVERY_CODE_TTL_MS } from '@shared/constants';
import * as dns from 'dns/promises';

@Injectable()
export class MailerService {
	constructor(private readonly mailer: Mailer) {}

	public async isDeliverable(email: string): Promise<boolean> {
		const domain = email.split('@')[1];

		// Создаём резолвер с явным DNS-сервером
		const resolver = new dns.Resolver();
		resolver.setServers(['8.8.8.8', '8.8.4.4']); // Google DNS

		try {
			const mxRecords = await resolver.resolveMx(domain);
			return mxRecords && mxRecords.filter((rec) => rec.exchange.length > 0).length > 0;
		} catch (error) {
			console.error(`DNS error for ${domain}:`, error);
			return false;
		}
	}

	public async sendMail(to: string, subject: string, text: string) {
		return this.mailer.sendMail({
			to,
			subject,
			text,
		});
	}

	public async sendEmailConfirmationMail(to: string, code: number | string) {
		const subject = 'Хайкерс | Код для подтверждения почты';

		return this.mailer.sendMail({
			headers: {
				'Content-Language': 'ru',
			},
			template: 'confirmEmail',
			context: {
				code,
				ttlMins: (EMAIL_CONFIRMATION_CODE_TTL_MS / 1000 / 60).toFixed(0),
				currentYear: new Date().getFullYear(),
			},
			to,
			subject,
		});
	}

	public async sendPasswordRecoveryMail(to: string, code: number | string) {
		const subject = 'Хайкерс | Код для восстановления пароля';

		return this.mailer.sendMail({
			headers: {
				'Content-Language': 'ru',
			},
			template: 'passwordRecovery',
			context: {
				code,
				ttlMins: (PASSWORD_RECOVERY_CODE_TTL_MS / 1000 / 60).toFixed(0),
				currentYear: new Date().getFullYear(),
			},
			to,
			subject,
		});
	}
}
