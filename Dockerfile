# Build stage
# Keep the Alpine version in sync with the production stage, which reuses this node binary
FROM node:24-alpine3.24 AS builder

WORKDIR /app

# Set build environment
ENV PUBLIC_ADAPTER='docker-node'

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy everything else (.dockerignore handles exclusions)
COPY . .

# Build the application
RUN npm run build

# Production stage
# Plain Alpine plus the node binary, without npm, yarn or corepack
FROM alpine:3.24

# Install node's shared libraries and create non-root user
RUN apk add --no-cache libstdc++ && addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /usr/local/bin/node /usr/local/bin/node

WORKDIR /app

# Set runtime environment
ENV PUBLIC_ADAPTER='docker-node'
ENV PORT=4173

# Copy only the built application from builder stage
COPY --from=builder --chown=appuser:appgroup /app/build ./build

# Switch to non-root user
USER appuser

# Expose port (vite preview default)
EXPOSE 4173

# Run the built application directly (no dependencies needed!)
CMD ["node", "build/index.js"]
