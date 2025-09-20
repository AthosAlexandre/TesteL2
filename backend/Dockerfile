FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY nest-cli.json tsconfig*.json ./
COPY jest.config.ts ./ 
COPY src ./src
COPY test ./test   

# build de produção (gera dist/)
RUN npm run build

EXPOSE 3000
