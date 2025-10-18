import { sql } from 'drizzle-orm';

export const getSubscribtionsQuery = (userId: string) =>
	sql`
SELECT 
  json_build_object(
    'id', users.id,
    'email', users.email, 
    'name', users.name,
    'username', users.username,
    'avatarFilename', users.avatar_filename
  ) AS user,
  user_subscribers.created_at AS "createdAt"
FROM user_subscribers
INNER JOIN users ON user_subscribers.user_id = users.id
WHERE user_subscribers.user_subscriber_id = ${userId}
  `;

export const getSubscribersQuery = (userId: string) =>
	sql`
SELECT 
  json_build_object(
    'id', users.id,
    'email', users.email, 
    'name', users.name,
    'username', users.username,
    'avatarFilename', users.avatar_filename
  ) AS user,
  user_subscribers.created_at AS "createdAt"
FROM user_subscribers
INNER JOIN users ON user_subscribers.user_subscriber_id = users.id
WHERE user_subscribers.user_id = ${userId}
  `;
