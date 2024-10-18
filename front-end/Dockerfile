FROM node:20.18-alpine3.20

WORKDIR /app

COPY package.json .
COPY yarn.lock .
RUN yarn install

CMD yarn dev