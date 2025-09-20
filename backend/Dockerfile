FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY nest-cli.json tsconfig*.json ./
COPY src ./src

# build de produção (gera dist/)
RUN npm run build

EXPOSE 3000
