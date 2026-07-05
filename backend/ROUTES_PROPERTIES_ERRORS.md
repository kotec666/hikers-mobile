# ROUTES PROPERTIES ERRORS

## 1. POST /posts

### 1.0. Общие ошибки:

- ERRORS.TOO_LARGE // Если запрос слишком много весит
- ERRORS.NOT_FOUND // Тренировка не найдена
- ERRORS.FORBIDDEN // Юзер не создатель тренировки
- ERRORS.USER_IN_NOT_FINISHED_TRAINING // Тренировка ещё не завершена

### 1.1. trainingId:

- ERRORS.MISMATCH // Если передана строка формата не UUID

### 1.2. title:

- ERRORS.INVALID_LENGTH

### 1.3. description:

- ERRORS.INVALID_LENGTH

### 1.4. files:

- ERRORS.BAD_REQUEST // Если с каким-то из файлов что-то не так. Не верный формат/Слишком много весит/Слишком много файлов. (все лимиты в shared/constants.ts)

## 2. PATCH /posts/:id

### 2.0. Общие ошибки:

- ERRORS.TOO_LARGE // Если запрос слишком много весит
- ERRORS.NOT_FOUND // Пост не найден
- ERRORS.FORBIDDEN // Юзер не создатель поста

### 2.1. id:

- ERRORS.MISMATCH // Если передана строка формата не UUID
- ERRORS.BAD_REQUEST

### 2.2. title:

- ERRORS.INVALID_LENGTH

### 2.3. description:

- ERRORS.INVALID_LENGTH

### 2.4. files:

- ERRORS.BAD_REQUEST // Если с каким-то из файлов что-то не так. Не верный формат/Слишком много весит/Слишком много файлов. (все лимиты в shared/constants.ts)

### 2.5. deletedFilenames:

- ERRORS.BAD_REQUEST // Если есть строка формата не UUID или это не массив (разделитель запятая, скобки [] не нужны)
- ERRORS.MISMATCH // Если хотя бы одно из имен файлов для удаления - не прикреплено к посту

## 3. POST /auth/registration

### 3.1. email:

- ERRORS.INVALID_LENGTH
- ERRORS.INVALID_EMAIL // Строка не формата почты
- ERRORS.ALREADY_EXISTS // Почта уже зарегана

### 3.2. password:

- ERRORS.INVALID_LENGTH
- ERRORS.DIGIT_REQUIRED

### 3.3. username:

- ERRORS.ALREADY_EXISTS // Такой никнейм уже используется
- ERRORS.MISMATCH // Не прошел регулярку (только латиница и цифры)
- ERRORS.INVALID_LENGTH

### 3.4. isTermsAccepted:

- ERRORS.BAD_REQUEST // Поле не передано, или передано false (чел не принял правила игры)

## 4. POST /auth/login

### 4.1. email:

- ERRORS.NOT_FOUND // Такой юзер не найден

### 4.2. password:

- ERRORS.MISMATCH // Не верный парол

## 5. POST /friends/invites/send/:userId

### 5.0. Общие ошибки:

- ERRORS.MISMATCH // Отправил запрос сам себе
- ERRORS.ALREADY_CREATED // Запрос в други уже отправлен
- ERRORS.ALREADY_EXISTS // Целевой юзер уже друк

### 5.1. userId:

- ERRORS.MISMATCH // id формата не UUID

## 6. POST /subscribers/:userId

### 6.0. Общие ошибки:

- ERRORS.MISMATCH // Отправил запрос сам себе
- ERRORS.ALREADY_EXISTS // Уже подписаны

### 6.1. userId:

- ERRORS.MISMATCH // id формата не UUID

## 7. POST /trainings/start

### 7.0. Общие ошибки:

- ERRORS.USER_IN_NOT_FINISHED_TRAINING // Юзер уже в незавершённой трене

### 7.1. type:

- ERRORS.MISMATCH // Это не тип тренироуки

### 7.2. colorHex:

- ERRORS.MISMATCH // Это не хекс цвет

### 7.3. ts?:

- ERRORS.BAD_REQUEST // Это не число
- ERRORS.DATE_IN_THE_FUTURE // Дата старта в будущем

## 8. POST /trainings/start

### 8.0. Общие ошибки:

- ERRORS.NOT_FOUND // Юзер не состоит в активной тренировке

### 8.1. ts?:

- ERRORS.BAD_REQUEST // Это не число
- ERRORS.DATE_IN_THE_PAST // Дата финиша раньше даты старта

## 9. PATCH /profile

### 9.0. Общие ошибки:

- ERRORS.NOT_FOUND // Юзер не найден

### 9.1. activities?:

- ERRORS.BAD_REQUEST // Если в нем строка формата не активности или это не массив (разделитель запятая, скобки [] не нужны)

### 9.2. username?:

- ERRORS.ALREADY_EXISTS // Такой никнейм уже используется
- ERRORS.MISMATCH // Не прошел регулярку (только латиница и цифры)
- ERRORS.INVALID_LENGTH

### 9.3. name?:

- ERRORS.INVALID_LENGTH

### 9.4. avatarFilename?:

- ERRORS.BAD_REQUEST // Если с файлом что-то не так. Не верный формат/Слишком много весит. (все лимиты в shared/constants.ts)

## 10. POST /auth/request-password-recovery

### 10.1. email:

- ERRORS.NOT_FOUND // Такая почта не зарегистрирована
- ERRORS.INVALID_EMAIL // Строка не формата почты

## 11. POST /auth/confirm-password-recovery

### Общие ошибки:

- ERRORS.NOT_FOUND // Запрос не найден или устарел

### 10.1. email:

- ERRORS.INVALID_EMAIL // Строка не формата почты

### 10.2. code:

- ERRORS.INVALID_LENGTH

## 12. POST /auth/recover-password

### Общие ошибки:

- ERRORS.NOT_FOUND // Подтверждение не найдено
- ERRORS.FORBIDDEN // Подтверждение не пройдено

### 12.1. email:

- ERRORS.INVALID_LENGTH
- ERRORS.INVALID_EMAIL // Строка не формата почты

### 12.2. password:

- ERRORS.SHOULD_BE_DIFFERENT // Пароль должен отличаться (от старого)
- ERRORS.INVALID_LENGTH
- ERRORS.DIGIT_REQUIRED

### 12.3. confirmPassword:

- ERRORS.MISMATCH // Пароли не совпадают
- ERRORS.INVALID_LENGTH
- ERRORS.DIGIT_REQUIRED

### 12.4. code:

- ERRORS.INVALID_LENGTH

## 13. POST /auth/request-confirm-email

### Общие ошибки:

- ERRORS.NOT_FOUND // Такой юзер не найден
- ERRORS.EMAIL_ALREADY_CONFIRMED // Почта уже подтверждена

### 13.1. email:

- ERRORS.NOT_FOUND // Такая почта не зарегистрирована
- ERRORS.INVALID_EMAIL // Строка не формата почты

## 14. POST /auth/confirm-email

### Общие ошибки:

- ERRORS.NOT_FOUND // Запрос не найден или устарел

### 14.1. code:

- ERRORS.INVALID_LENGTH
- ERRORS.MISMATCH // Неверный код

## 15. POST /reports

### 15.0. Общие ошибки:

- ERRORS.TOO_LARGE // Если запрос слишком много весит

### 15.1. type:

- ERRORS.MISMATCH // Неверный тип

### 15.2. text:

- ERRORS.INVALID_LENGTH

### 15.3. relEntityId:

- ERRORS.MISMATCH // Если передана строка формата не UUID ЛИБО если по type нужна сущность, а поле relEntityId не передано

### 15.4. files:

- ERRORS.BAD_REQUEST // Если с каким-то из файлов что-то не так. Не верный формат/Слишком много весит/Слишком много файлов. (все лимиты в shared/constants.ts)
