# Multi-stage Dockerfile for Pêche Normandie - Fiches Techniques
# Stage 1: Build & Validate
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Copy source data, scripts, and static assets needed for build
COPY data/ ./data/
COPY scripts/ ./scripts/
COPY site/ ./site/

# Validate data integrity & pre-compile site/data.js
RUN node scripts/validate-species.mjs && node scripts/build-site.mjs

# Stage 2: Runtime image
FROM node:24-alpine AS runner

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production \
    PORT=3000

# Create a non-root group and user for security hardening
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built application and required assets from builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/data ./data
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/site ./site

# Assign ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose server port
EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/ || exit 1

# Start native Node.js HTTP server
CMD ["node", "scripts/serve.mjs"]
