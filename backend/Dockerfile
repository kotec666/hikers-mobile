# 🚀 Builder Stage
FROM node:24 AS builder

WORKDIR /app

RUN apt install -y openssl

RUN npm install -g @nestjs/cli

COPY ./package.json .

# yarn install --force пока не надо
RUN yarn install

COPY . .

RUN yarn db:push

RUN yarn build

CMD ["sh", "-c", "node dist/src/main.js"]
