FROM node:18-alpine AS base

ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cm9idXN0LWphdmVsaW4tNzguY2xlcmsuYWNjb3VudHMuZGV2JA
ENV NEXT_PUBLIC_VAPID_PUBLIC_KEY=BFakAyz7p5hsqlML7CgajtGsPxP6RUuGP_4driHUY60Jk3RsmNkzioSGQM3FB-46MAq3l5wsk_VednFC8qVzWWY

ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

FROM base AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci

RUN npx next-ws-cli patch

COPY prisma ./prisma
RUN npx prisma generate

FROM base AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./ 
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static


USER nextjs

CMD ["node", "server.js"]