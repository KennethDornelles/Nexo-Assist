FROM node:22.12.0-bookworm-slim AS build
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @nexo/backend build
FROM node:22.12.0-bookworm-slim
WORKDIR /app
COPY --from=build /app /app
ENV NODE_ENV=production
CMD ["node","backend/dist/main.js"]
