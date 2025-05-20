# syntax=docker/dockerfile:1

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies only when needed
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables
ENV NODE_ENV=production

# Build if needed (uncomment if you have a build step)
# RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 medusa

# Set environment variables
ENV NODE_ENV=production

# Copy built application
COPY --from=builder --chown=medusa:nodejs /app ./

# Switch to non-root user
USER medusa

# Expose port
EXPOSE 9000

# Set hostname
ENV PORT 9000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "start"] 