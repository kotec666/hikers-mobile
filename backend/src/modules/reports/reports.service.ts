import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ReportDto } from './reports.dto';
import { CommonDto } from '../../common/dto/common.dto';
import { reportMedia, reports, users } from '../database/schema';
import { ReportType } from '@shared/enums';
import { ERRORS } from '@shared/errors';
import { StaticService } from '../static/static.service';
import { and, desc, eq, inArray } from 'drizzle-orm';

@Injectable()
export class ReportsService {
	constructor(
		private readonly db: DatabaseService,
		private readonly files: StaticService,
	) {}

	public async create(userId: string, dto: ReportDto.Creation): Promise<CommonDto.BooleanResponse> {
		if (dto.type !== ReportType.COMMON && !dto.relEntityId) {
			throw new BadRequestException(`_relEntityId:${ERRORS.MISMATCH}`);
		}

		const valuesToInsert = {
			fromUserId: userId,
			text: dto.text,
			type: dto.type,
		};
		if (dto.relEntityId) {
			valuesToInsert['addons'] = { relEntityId: dto.relEntityId };
		}

		const [report] = await this.db.db.insert(reports).values(valuesToInsert).returning({ id: reports.id });

		// @TODO ловить ошибку на медиа
		if (typeof dto.files !== 'undefined') {
			await this.attachFiles(report.id, dto.files);
		}
		// @TODO try...catch на кетч ошибки загруженные файлы откатывать

		return { success: true };
	}

	public async getByUser(
		userId: string,
		page: number,
		limit: number,
		types?: ReportType[],
	): Promise<ReportDto.Entity[]> {
		const offset = Math.max(0, (page - 1) * limit);

		const typesCond = typeof types !== 'undefined' ? inArray(reports.type, types) : undefined;

		const rows = await this.db.db
			.select({
				id: reports.id,
				type: reports.type,
				addons: reports.addons,
				text: reports.text,
				createdAt: reports.createdAt,

				fromUser: {
					id: users.id,
					name: users.name,
					username: users.username,
					color: users.color,
					avatarFilename: users.avatarFilename,
				},
			})
			.from(reports)
			.where(and(eq(reports.fromUserId, userId), typesCond))
			.innerJoin(users, eq(users.id, reports.fromUserId))
			.orderBy(desc(reports.createdAt))
			.offset(offset)
			.limit(limit);

		const reportsIds = rows.map((p) => p.id);

		const files = await this.getReportsFileNames(reportsIds);

		const filesByReportId = new Map<string, string[]>();
		files.forEach((file) => {
			const existing = filesByReportId.get(file.reportId) ?? [];
			existing.push(file.mediaFilename);
			filesByReportId.set(file.reportId, existing);
		});

		const reportEntities: ReportDto.Entity[] = [];

		rows.forEach((row) => {
			const fileNames = filesByReportId.get(row.id) ?? [];

			reportEntities.push({ ...row, fileNames });
		});

		return reportEntities;
	}

	public async getReportsFileNames(reportsIds: string[]): Promise<
		{
			reportId: string;
			mediaFilename: string;
		}[]
	> {
		return this.db.db
			.select({
				reportId: reportMedia.reportId,
				mediaFilename: reportMedia.mediaFilename,
			})
			.from(reportMedia)
			.where(inArray(reportMedia.reportId, reportsIds));
	}

	public async attachFiles(reportId: string, files: Express.Multer.File[]): Promise<string[]> {
		const mediaIds: string[] = [];

		await Promise.all(
			files.map(async (file) => {
				// @TODO тест что если файл не догрузится
				try {
					const mediaId = await this.attachFile(reportId, file);
					mediaIds.push(mediaId);
					return file;
				} catch (error) {
					console.error(`Файл ${file.originalname} не догрузился в репорт ${reportId} по причине:`, error);
				}
			}),
		);

		return mediaIds;
	}

	public async attachFile(reportId: string, file: Express.Multer.File): Promise<string> {
		if (!(file satisfies Express.Multer.File)) {
			throw new BadRequestException(ERRORS.BAD_REQUEST);
		}

		const mediaFilename = await this.files.uploadFile(file);
		const [media] = await this.db.db
			.insert(reportMedia)
			.values({
				reportId: reportId,
				mediaFilename,
			})
			.returning({ id: reportMedia.id });

		return media.id;
	}
}
