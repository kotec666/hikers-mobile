import { Controller } from '@nestjs/common';
import { TypedRoute, TypedBody } from '@nestia/core';
import { TestingService } from './testing.service';
import { Testing } from './testing.dto';

@Controller('testing')
export class TestingController {
	constructor(private readonly service: TestingService) {}

	/**
	 * @tag Testing
	 * @summary Make a log
	 * @description Stores text log in DB and shows it into the server console
	 */
	@TypedRoute.Post()
	async create(@TypedBody() dto: Testing.Request) {
		return this.service.createTestingLog(dto.text);
	}

	/**
	 * @tag Testing
	 * @summary Get all logs
	 */
	@TypedRoute.Get()
	async getAll() {
		return this.service.getAllTestingLogs();
	}

	/**
	 * @tag Testing
	 * @summary Delete all logs
	 */
	@TypedRoute.Delete()
	async deleteAll() {
		return this.service.deleteAllTestingLogs();
	}
}
