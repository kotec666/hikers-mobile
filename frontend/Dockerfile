FROM node:24 AS builder

WORKDIR /app

# Копируем файлы
COPY frontend/ ./frontend/
COPY shared/ ./shared/

# Устанавливаем зависимости
WORKDIR /app/frontend
RUN yarn install --frozen-lockfile

# Сборка
RUN yarn build

# Запуск емае
CMD [ "yarn", "start" ]
