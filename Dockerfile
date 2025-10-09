# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Set build environment
ENV PUBLIC_ADAPTER='docker-node'
ENV VITE_ALLOWED_HOSTS='localhost'

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy source files and configs needed for build
COPY src ./src
COPY static ./static
COPY svelte.config.js vite.config.ts tsconfig.json ./
COPY postcss.config.cjs tailwind.config.js ./
COPY .typesafe-i18n.json ./

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Set runtime environment
ENV PUBLIC_ADAPTER='docker-node'
ENV VITE_ALLOWED_HOSTS='localhost'

# Copy only the built application from builder stage
COPY --from=builder --chown=appuser:appgroup /app/build ./build

# Switch to non-root user
USER appuser

# Expose port (SvelteKit default is 3000)
EXPOSE 3000

# Run the built application directly (no dependencies needed!)
CMD ["node", "build/index.js"]
