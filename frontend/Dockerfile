FROM node:22-alpine

WORKDIR /app

COPY package.json .

RUN yarn
RUN npm i -g serve

COPY . .

RUN yarn build

CMD [ "yarn", "start" ]
