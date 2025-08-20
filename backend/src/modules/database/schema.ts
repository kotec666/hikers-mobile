import {
	pgTable,
	uuid,
	varchar,
	timestamp,
	integer,
	decimal,
	text,
	primaryKey,
	smallint,
	index,
	customType,
	uniqueIndex,
} from 'drizzle-orm/pg-core';

/**
 * CUSTOM TYPES
 */

export const lineString = customType<{ data: string; driverData: string }>({
	dataType() {
		return 'geometry(LineString, 4326)';
	},
});

/**
 * MODELS
 */

// Media
export const media = pgTable(
	'media',
	{
		filename: varchar('filename', { length: 255 }).primaryKey(),
		originalName: varchar('original_name', { length: 255 }).notNull(),
		fileType: varchar('filetype', { length: 63 }),
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	(table) => [uniqueIndex('media_name_idx').on(table.filename)],
);

// Users
export const users = pgTable(
	'users',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		email: varchar('email', { length: 255 }).notNull().unique(),
		password: varchar('password', { length: 255 }).notNull(),
		name: varchar('name', { length: 255 }).notNull(),
		username: varchar('username', { length: 63 }).notNull().unique(),
		avatarFilename: varchar('avatar_filename', { length: 255 }).references(() => media.filename),
		termsAcceptedAt: timestamp('terms_accepted_at'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	(table) => [uniqueIndex('usr_id_idx').on(table.id)], // @TODO index('usr_name_idx').using('gin', table.name)
);

// User Subscribers (many-to-many)
export const userSubscribers = pgTable(
	'user_subscribers',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		userSubscriberId: uuid('user_subscriber_id')
			.notNull()
			.references(() => users.id),
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.userId, table.userSubscriberId] }),
	}),
);

// User Friends (many-to-many)
export const userFriends = pgTable(
	'user_friends',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		userFriendId: uuid('user_friend_id')
			.notNull()
			.references(() => users.id),
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.userId, table.userFriendId] }),
	}),
);

// User Friends Invites
export const userFriendsInvites = pgTable('user_friends_invites', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id),
	invitedUserId: uuid('invited_user_id')
		.notNull()
		.references(() => users.id),
});

// Achievements
export const achievements = pgTable('achievements', {
	id: uuid('id').primaryKey().defaultRandom(),
	iconFilename: varchar('icon_filename', { length: 255 }).references(() => media.filename),
	colorHex: varchar('color_hex', { length: 7 }),
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	claimedPercent: decimal('claimed_percent', { precision: 5, scale: 2 }),
});

// User Achievements (many-to-many)
export const userAchievements = pgTable(
	'user_achievments',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		achievementId: uuid('achievment_id')
			.notNull()
			.references(() => achievements.id),
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.achievementId] }),
		uniqueIndex('achv_idx').on(table.userId, table.achievementId),
	],
);

// Training Types
export const trainingTypes = pgTable('training_types', {
	name: varchar('name', { length: 127 }).primaryKey(),
	measuringUnit: varchar('measuring_unit', { length: 31 }).notNull(),
	iconFilename: varchar('icon_filename', { length: 255 }).references(() => media.filename),
});

// User Activities
export const userActivities = pgTable(
	'user_activities',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		placeForShow: smallint('place_for_show'), // 1, 2, 3
		type: varchar('type')
			.notNull()
			.references(() => trainingTypes.name),
		goal: integer('goal').notNull(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.type] }), index('activ_usr_idx').on(table.userId)],
);

// Training
export const training = pgTable(
	'training',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userCreatorId: uuid('user_creator_id')
			.notNull()
			.references(() => users.id),
		type: varchar('type')
			.notNull()
			.references(() => trainingTypes.name),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		startedAt: timestamp('started_at'),
		finishedAt: timestamp('finished_at'),
	},
	(table) => [uniqueIndex('trn_idx').on(table.id)],
);

// Training Participants
export const trainingParticipants = pgTable(
	'training_participants',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		trainingId: uuid('training_id')
			.notNull()
			.references(() => training.id),
		colorHex: varchar('color_hex', { length: 7 }),
	},
	(table) => [uniqueIndex('trn_part_idx').on(table.userId, table.trainingId)],
);

// Training Routes
export const trainingRoutes = pgTable(
	'training_routes',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		participantId: uuid('participant_id')
			.notNull()
			.references(() => trainingParticipants.id),
		// points: lineString('points'), @TODO
		createdAt: timestamp('created_at').defaultNow().notNull(),
		startedAt: timestamp('started_at'),
		finishedAt: timestamp('finished_at'),
	},
	(table) => [index('trn_route_idx').on(table.participantId)],
);

// Training Metrics
export const trainingMetrics = pgTable(
	'training_metrics',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		participantId: uuid('participant_id')
			.notNull()
			.references(() => trainingParticipants.id),
		timeMin: integer('time_min'),
		// speedKmh: smallint('speed_kmh'), @TODO в отдельную таблицу
		avgSpeedKmh: smallint('avg_speed_kmh'),
		avgTempoMinSec: decimal('avg_tempo_min_sec', { precision: 4, scale: 2 }),
		distanceM: integer('distance_m'),
		altitudeGainM: smallint('altitude_gain_m'),
		kkcal: smallint('kkcal'),
	},
	(table) => [index('trn_metr_idx').on(table.participantId)],
);

// Training Invites
export const trainingInvites = pgTable('training_invites', {
	id: uuid('id').primaryKey().defaultRandom(),
	trainingId: uuid('training_id')
		.notNull()
		.references(() => training.id),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id),
	invitedUserId: uuid('invited_user_id')
		.notNull()
		.references(() => users.id),
});

// Posts
export const posts = pgTable(
	'posts',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		trainingId: uuid('training_id').references(() => training.id),
		userCreatorId: uuid('user_creator_id')
			.notNull()
			.references(() => users.id),
		title: varchar('title', { length: 255 }).notNull(),
		description: text('description'),
		likesCount: integer('likes_count').default(0),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	(table) => [uniqueIndex('post_idx').on(table.id), index('post_usr_idx').on(table.userCreatorId)],
);

// Post Media (many-to-many)
export const postMedia = pgTable(
	'post_media',
	{
		postId: uuid('post_id')
			.notNull()
			.references(() => posts.id),
		mediaFilename: varchar('media_filename', { length: 255 })
			.notNull()
			.references(() => media.filename),
	},
	(table) => [
		primaryKey({ columns: [table.postId, table.mediaFilename] }),
		uniqueIndex('post_mdeia_idx').on(table.postId, table.mediaFilename),
	],
);

// Notifications
export const notifications = pgTable(
	'notifications',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		iconFilename: varchar('icon_filename', { length: 255 }).references(() => media.filename),
		toUserId: uuid('to_user_id')
			.notNull()
			.references(() => users.id),
		text: varchar('text', { length: 255 }).notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		readedAt: timestamp('readed_at'),
	},
	(table) => [index('ntf_usr_idx').on(table.toUserId)],
);

/**
 * TESTING MODELS
 */

// Feedback
export const feedback = pgTable('feedback', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	text: text('text'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Testing
export const testing = pgTable('testing', {
	id: uuid('id').primaryKey().defaultRandom(),
	text: text('text'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});
