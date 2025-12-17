FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared-types/package.json ./packages/shared-types/

RUN npm ci

COPY apps/backend ./apps/backend/
COPY packages/shared-types ./packages/shared-types/

WORKDIR /app/packages/shared-types
RUN npm run build --if-present

WORKDIR /app/apps/backend

EXPOSE 5001

CMD ["npm", "run", "dev"]

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared-types/package.json ./packages/shared-types/

RUN npm ci

COPY apps/backend ./apps/backend/
COPY packages/shared-types ./packages/shared-types/

WORKDIR /app/packages/shared-types
RUN npm run build --if-present

WORKDIR /app/apps/backend
RUN npm run build

FROM node:20-alpine AS production

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

COPY package*.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared-types/package.json ./packages/shared-types/

RUN npm ci --omit=dev

COPY --from=builder --chown=nodejs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared-types/dist ./packages/shared-types/dist

USER nodejs

WORKDIR /app/apps/backend

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/server.js"]
