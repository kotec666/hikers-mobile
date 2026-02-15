import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { UserInterceptor } from '@interceptors/user.interceptor';

/**
 * Декоратор для проверки авторизации и получения пользователя.
 *
 * @example
 * ‍@Auth()
 * async someFunc(...) {
 *   // код функции
 * }
 */
export function Auth() {
	return applyDecorators(UseInterceptors(UserInterceptor));
}
