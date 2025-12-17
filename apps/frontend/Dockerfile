FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared-types/package.json ./packages/shared-types/

RUN npm ci

COPY apps/frontend ./apps/frontend/
COPY packages/shared-types ./packages/shared-types/

WORKDIR /app/packages/shared-types
RUN npm run build --if-present

WORKDIR /app/apps/frontend

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared-types/package.json ./packages/shared-types/

RUN npm ci

COPY apps/frontend ./apps/frontend/
COPY packages/shared-types ./packages/shared-types/

WORKDIR /app/packages/shared-types
RUN npm run build --if-present

WORKDIR /app/apps/frontend
RUN npm run build

FROM nginx:alpine AS production

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
