FROM node:24 AS builder

WORKDIR /app

COPY frontend/package.json frontend/yarn.lock ./

RUN yarn install --frozen-lockfile
RUN npm i -g serve

COPY frontend/ .

COPY shared/ ./src/shared/

RUN yarn build

CMD [ "yarn", "start" ]
