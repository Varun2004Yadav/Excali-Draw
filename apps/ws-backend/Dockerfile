# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/db/package.json ./packages/db/
COPY packages/backend-common/package.json ./packages/backend-common/
COPY packages/common/package.json ./packages/common/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY apps/ws-backend/package.json ./apps/ws-backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
WORKDIR /app/packages/db
RUN pnpm prisma generate

# Build the application
WORKDIR /app/apps/ws-backend
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/db/package.json ./packages/db/
COPY packages/backend-common/package.json ./packages/backend-common/
COPY packages/common/package.json ./packages/common/
COPY apps/ws-backend/package.json ./apps/ws-backend/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application and generated Prisma client
COPY --from=builder /app/apps/ws-backend/dist ./apps/ws-backend/dist
COPY --from=builder /app/packages/db/src/generated ./packages/db/src/generated
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma
COPY --from=builder /app/packages/backend-common/dist ./packages/backend-common/dist
COPY --from=builder /app/packages/common/dist ./packages/common/dist

# Copy source files needed at runtime
COPY packages/db/src/index.ts ./packages/db/src/
COPY packages/backend-common/src ./packages/backend-common/src/
COPY packages/common/src ./packages/common/src/

WORKDIR /app/apps/ws-backend

EXPOSE 8080

CMD ["node", "dist/index.js"]




