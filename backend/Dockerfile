FROM node:24 AS builder

WORKDIR /app

RUN apt install -y openssl

RUN npm install -g @nestjs/cli

COPY backend/package.json backend/yarn.lock ./

RUN yarn install --frozen-lockfile

COPY backend/ .

COPY shared/ ./src/shared/

RUN yarn build

CMD ["sh", "-c", "yarn db:push node dist/src/main.js"]
