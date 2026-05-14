import { Module } from '@nestjs/common';
import { MailerController } from './mailer.controller';
import { MailerService } from './mailer.service';

@Module({
	controllers: [MailerController],
	exports: [MailerService],
	imports: [],
	providers: [MailerService],
})
export class MailerModule {}
