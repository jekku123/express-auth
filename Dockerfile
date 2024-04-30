# syntax=docker/dockerfile:1

FROM oven/bun:1 as base

WORKDIR /usr/src/app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
EXPOSE 8080
CMD ["bun", "dev"]
