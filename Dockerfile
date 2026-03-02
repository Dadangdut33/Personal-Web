# https://docs.adonisjs.com/deployment#dockerfile
FROM node:24-alpine AS base
RUN corepack enable

# ----------------------------
# Stage 1: Install all dependencies
# ----------------------------
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ----------------------------
# Stage 2: Build the application
# ----------------------------
FROM deps AS build
WORKDIR /app
COPY . .
RUN node ace build

# ----------------------------
# Stage 3: Production runtime
# ----------------------------
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/build ./
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --prod --frozen-lockfile

EXPOSE 3333
CMD ["node", "bin/server.js"]
