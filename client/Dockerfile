FROM node:18-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json ./
RUN yarn install

COPY . .
ENV NODE_ENV=production
RUN yarn run build

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

CMD yarn start