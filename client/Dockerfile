FROM node:18-alpine AS build

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production

COPY . .
ENV NODE_ENV=production
RUN yarn run build

FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/package.json /app/yarn.lock ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

RUN yarn global add next

CMD yarn start