# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache postgresql16-client

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install drizzle-kit@0.30.4 --no-save

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY drizzle.config.ts ./drizzle.config.ts

RUN chown -R node:node /app
USER node
EXPOSE 3001
ENV NODE_ENV=production

COPY --chown=node:node docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "dist/src/index.js"]