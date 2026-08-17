/**
 * Параметры автоматического завершения тренировки.
 * Отсчёт идёт от `startedAt` активной тренировки (wall-clock).
 */

/** Через сколько после старта тренировка будет завершена автоматически */
export const WORKOUT_AUTO_FINISH_AFTER_MS = 24 * 60 * 60 * 1000 // 24 часа
// export const WORKOUT_AUTO_FINISH_AFTER_MS = 60000 // 1 минута

/** За сколько до автозавершения нужно предупредить пользователя */
export const WORKOUT_AUTO_FINISH_WARNING_BEFORE_MS = 5 * 60 * 1000 // 5 минут
// export const WORKOUT_AUTO_FINISH_WARNING_BEFORE_MS = 30000 // 30 секунд
