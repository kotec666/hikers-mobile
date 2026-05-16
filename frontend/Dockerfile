FROM node:24 AS builder

WORKDIR /app

# Копируем файлы
COPY frontend/ ./frontend/
COPY shared/ ./shared/

# Включаем Corepack и активируем Yarn
RUN corepack enable
RUN corepack prepare yarn@4.14.1 --activate

# Устанавливаем зависимости
WORKDIR /app/frontend
RUN yarn install --frozen-lockfile

# Сборка
RUN yarn build

# Запуск емае
CMD [ "yarn", "start" ]
