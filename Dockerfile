FROM node:20-alpine

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

ENV PUBLIC_ADAPTER='docker-node'

COPY . .

# Change ownership of the application files to the non-root user
RUN chown -R appuser:appgroup /app

# Install dependencies and build as root
RUN npm ci && npm run build

# Switch to non-root user
USER appuser

CMD ["npx", "vite", "preview", "--host"]
