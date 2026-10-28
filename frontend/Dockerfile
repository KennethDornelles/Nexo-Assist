FROM node:22.12.0-bookworm-slim
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install --frozen-lockfile && pnpm --filter @nexo/frontend build
CMD ["pnpm","--filter","@nexo/frontend","start"]
