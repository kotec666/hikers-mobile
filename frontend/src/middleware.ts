import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { env } from '@/consts/env'

const redirectInstance: Record<string, string> = {
	'/reg': '/',
	'/auth': '/',
	bebra: ''
}

/**
 *
 *  const cspHeader = `
 *     default-src 'self'; - Базовое правило для всех типов контента (разрешён только текущий домен)
 *     script-src ${scriptSrc}; - Источники для выполнения JavaScript (доп. переменная scriptSrc)
 *     script-src-elem 'self' 'unsafe-inline'; - Разрешает встроенные скрипты (например, в тегах script)
 *     style-src 'self' 'unsafe-inline'; - Разрешает стили с текущего домена и встроенные стили
 *     media-src 'self'; - Разрешает медиа (аудио, видео) только с текущего домена
 *     img-src 'self' blob: data:; - Разрешает изображения с текущего домена, blob: и data: URI
 *     font-src 'self'; - Разрешает загрузку шрифтов только с текущего домена
 *     connect-src 'self' ${env.api}; - Разрешает AJAX/WebSocket соединения с текущего домена и API
 *     object-src 'none'; - Запрещает плагины (Flash, Java applets и т.д.)
 *     base-uri 'self'; - Ограничивает тег <base> текущим доменом
 *     manifest-src 'self'; - Разрешает веб-манифесты только с текущего домена
 *     form-action 'self'; - Ограничивает отправку форм только на текущий домен
 *     frame-ancestors 'none'; - Запрещает встраивание страницы в iframe (аналог X-Frame-Options)
 *     ${isDev ? "" : "upgrade-insecure-requests;"} - В продакшене автоматически обновляет HTTP до HTTPS
 *   `;
 *
 * **/

const securityHeaders = [
	{
		key: 'Strict-Transport-Security', // Принудительное использование HTTPS вместо HTTP
		value: 'max-age=31536000; includeSubDomains; preload'
	},
	{ key: 'Access-Control-Allow-Origin', value: `${env.api}` }, // Разрешенные домены для CORS
	{
		key: 'Access-Control-Allow-Methods', // Разрешенные HTTP-методы
		value: 'GET, POST, PUT, DELETE, OPTIONS'
	},
	{ key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }, // Разрешает браузеру отправлять заголовки `Content-Type` и `Authorization` в CORS-запросах
	{ key: 'X-DNS-Prefetch-Control', value: 'on' }, // Управление предварительным разрешением DNS
	{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }, // Защита от clickjacking
	{ key: 'X-Content-Type-Options', value: 'nosniff' }, // Отключение MIME-sniffing
	{ key: 'X-Download-Options', value: 'noopen' }, // Защита для IE от автоматического открытия загрузок
	{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }, // Контроль передачи Referer
	// { key: "Timing-Allow-Origin", value: `${env.web_url}` }, // Доступ к timing-информации для указанных доменов
	{ key: 'X-XSS-Protection', value: '1; mode=block' }, // Защита от XSS-атак (устарело, но поддерживается)
	{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin' }, // Изолирует окно/вкладку от доступа через `window.opener` со сторонних доменов
	{ key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' }, // Блокирует загрузку кросс-доменных ресурсов без явного разрешения (CORS, CORP)
	{ key: 'Cross-Origin-Resource-Policy', value: 'same-site' }, // Предотвращает загрузку ваших ресурсов (например, изображений, PDF) на чужих сайтах через <img>, <iframe>, <script> и т. д.
	{
		key: 'Permissions-Policy', // Контроль доступа к API браузера и функций
		value: 'camera=(), microphone=(), geolocation=(), accelerometer=(), autoplay=(), fullscreen=(), gyroscope=(), magnetometer=(), payment=(), sync-xhr=self'
	} // () - none
]

export function middleware(request: NextRequest) {
	const { nextUrl } = request
	const token = request.cookies.get('token')?.value
	const isDev = env.NODE_ENV === 'development'
	const host = request.nextUrl.host
	const protocol = request.nextUrl.protocol

	const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
	const scriptSrc = [
		"'self'",
		`'nonce-${nonce}'`,
		isDev ? "'unsafe-eval'" : '',
		"'strict-dynamic'",
		`${protocol}//${host}`
	]
		.filter(Boolean)
		.join(' ')

	// child-src https://youtube.com для iframe

	const cspHeader = `
    default-src 'self';
    script-src ${scriptSrc};
    script-src-elem 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    media-src 'self';
    img-src 'self' blob: data:;
    font-src 'self';
    connect-src 'self' ${env.api};
    object-src 'none';
    base-uri 'self';
    manifest-src 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${isDev ? '' : 'upgrade-insecure-requests;'}
  `
		.replace(/\s+/g, ' ')
		.trim()

	const requestHeaders = new Headers(request.headers)
	requestHeaders.set('x-nonce', nonce)
	requestHeaders.set('Content-Security-Policy', cspHeader)

	if (token && nextUrl.pathname in redirectInstance) {
		return NextResponse.redirect(new URL(redirectInstance[nextUrl.pathname], nextUrl))
	}

	const response = NextResponse.next({
		request: {
			headers: requestHeaders
		}
	})

	response.headers.set('Content-Security-Policy', cspHeader)

	/* etc. заголовки */
	securityHeaders.map((secureHeader) => response.headers.set(secureHeader.key, secureHeader.value))
	/* etc. заголовки */

	return response
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		{
			source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
			missing: [
				{ type: 'header', key: 'next-router-prefetch' },
				{ type: 'header', key: 'purpose', value: 'prefetch' }
			]
		}
	]
}
