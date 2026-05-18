import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Module({
	controllers: [],
	exports: [MailerService],
	imports: [],
	providers: [MailerService],
})
export class MailerModule {}
