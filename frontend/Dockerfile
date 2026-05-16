FROM node:24 AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY frontend/package.json frontend/yarn.lock ./frontend
COPY shared/ ./shared/

# Устанавливаем зависимости
WORKDIR /app/frontend
RUN yarn install --frozen-lockfile

# Копируем исходники фронтенда
COPY frontend/ .

# Сборка
RUN yarn build

# Запуск емае
CMD [ "yarn", "start" ]
