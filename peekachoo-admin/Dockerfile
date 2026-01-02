# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the Next.js app
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Declare build arguments
ARG PORT
ARG HOSTNAME
ARG ADMIN_PASSWORD
ARG BACKEND_URL
ARG ADMIN_API_KEY

# Set environment variables from build arguments
ENV PORT=${PORT}
ENV HOSTNAME=${HOSTNAME}
ENV ADMIN_PASSWORD=${ADMIN_PASSWORD}
ENV BACKEND_URL=${BACKEND_URL}
ENV ADMIN_API_KEY=${ADMIN_API_KEY}

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
