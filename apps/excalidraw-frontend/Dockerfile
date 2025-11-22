# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ui/package.json ./packages/ui/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY apps/excalidraw-frontend/package.json ./apps/excalidraw-frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/ui ./packages/ui
COPY apps/excalidraw-frontend ./apps/excalidraw-frontend

# Build Next.js application
WORKDIR /app/apps/excalidraw-frontend
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ui/package.json ./packages/ui/
COPY apps/excalidraw-frontend/package.json ./apps/excalidraw-frontend/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/excalidraw-frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/excalidraw-frontend/.next/static ./apps/excalidraw-frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/excalidraw-frontend/public ./apps/excalidraw-frontend/public

USER nextjs

WORKDIR /app/apps/excalidraw-frontend

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

