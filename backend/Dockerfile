# 🚀 Builder Stage
FROM node:22 AS builder

WORKDIR /app

RUN apt install -y openssl

RUN npm install -g @nestjs/cli

COPY . .

RUN yarn install --force

RUN yarn db:push

RUN yarn build

CMD ["sh", "-c", "node dist/src/main.js"]
