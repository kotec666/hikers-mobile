import { MailerService as Mailer } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EMAIL_CONFIRMATION_CODE_TTL_MS, PASSWORD_RECOVERY_CODE_TTL_MS } from '@shared/constants';
import { ERRORS } from '@shared/errors';
import dns from 'dns/promises';

@Injectable()
export class MailerService {
	constructor(private readonly mailer: Mailer) {}

	public async isDeliverable(email: string): Promise<boolean> {
		const domain = email.split('@')[1];

		try {
			const mxRecords = await dns.resolveMx(domain);
			// If MX records exist, domain can receive email
			return mxRecords && mxRecords.length > 0;
		} catch (error) {
			// No MX records found - domain cannot receive email
			console.log(`Domain ${domain} cannot receive email`);
			return false;
		}
	}

	public async sendMail(to: string, subject: string, text: string) {
		const isEmailValid = await this.isDeliverable(to);
		if (!isEmailValid) {
			throw new BadRequestException(ERRORS.INVALID_EMAIL);
		}

		return this.mailer.sendMail({
			to,
			subject,
			text,
		});
	}

	public async sendEmailConfirmationMail(to: string, code: number | string) {
		const isEmailValid = await this.isDeliverable(to);
		if (!isEmailValid) {
			throw new BadRequestException(ERRORS.INVALID_EMAIL);
		}

		const subject = `Заголовок ${Date.now()}`;

		return this.mailer.sendMail({
			headers: {
				'Content-Language': 'ru',
			},
			template: 'confirmEmail',
			context: {
				code,
				ttlMins: (EMAIL_CONFIRMATION_CODE_TTL_MS / 1000 / 60).toFixed(0),
			},
			to,
			subject,
		});
	}

	public async sendPasswordRecoveryMail(to: string, code: number | string) {
		const isEmailValid = await this.isDeliverable(to);
		if (!isEmailValid) {
			throw new BadRequestException(ERRORS.INVALID_EMAIL);
		}

		const subject = `Заголовок ${Date.now()}`;

		return this.mailer.sendMail({
			headers: {
				'Content-Language': 'ru',
			},
			template: 'passwordRecovery',
			context: {
				code,
				ttlMins: (PASSWORD_RECOVERY_CODE_TTL_MS / 1000 / 60).toFixed(0),
			},
			to,
			subject,
		});
	}
}
