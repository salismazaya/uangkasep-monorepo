FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json .
COPY bun.lockb .
RUN bun install

CMD bun dev