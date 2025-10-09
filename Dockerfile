# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Set build environment
ENV PUBLIC_ADAPTER='docker-node'
ENV VITE_ALLOWED_HOSTS='localhost'

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy everything else (.dockerignore handles exclusions)
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Set runtime environment
ENV PUBLIC_ADAPTER='docker-node'

# Copy only the built application from builder stage
COPY --from=builder --chown=appuser:appgroup /app/build ./build

# Switch to non-root user
USER appuser

# Expose port (SvelteKit default is 3000)
EXPOSE 3000

# Run the built application directly (no dependencies needed!)
CMD ["node", "build/index.js"]
