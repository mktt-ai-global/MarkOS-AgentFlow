# Multi-stage Dockerfile for Next.js 14 Dashboard
# Stage 1: Build Stage
FROM node:18-alpine AS builder

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files (Assumes workspace context if monorepo)
COPY apps/dashboard/package*.json ./apps/dashboard/
# Copy pnpm lock if using pnpm (though package-lock.json was seen)
# COPY pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies (Standard npm install based on lock file)
RUN cd apps/dashboard && npm ci

# Copy the rest of the dashboard source code
COPY apps/dashboard ./apps/dashboard

# Build application
ENV NEXT_TELEMETRY_DISABLED 1
RUN cd apps/dashboard && npm run build

# Stage 2: Final Production Stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Security: Non-privileged user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy build artifacts
# We copy node_modules and the built .next folder
COPY --from=builder /app/apps/dashboard/public ./apps/dashboard/public
COPY --from=builder /app/apps/dashboard/.next ./apps/dashboard/.next
COPY --from=builder /app/apps/dashboard/node_modules ./apps/dashboard/node_modules
COPY --from=builder /app/apps/dashboard/package.json ./apps/dashboard/package.json

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

WORKDIR /app/apps/dashboard
CMD ["npm", "start"]
