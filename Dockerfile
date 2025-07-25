FROM oven/bun:latest as builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY bun.lock* package-lock.json* yarn.lock* ./

# Install dependencies
RUN bun pm untrusted
RUN bun install

# Copy source files
COPY . .
# Build the application
RUN bun run build

# Production stage
FROM oven/bun:latest

WORKDIR /app

# Copy package files for production
COPY --from=builder /app/package.json ./

# Copy build outputs from builder
COPY --from=builder /app/.output /app/.output

RUN bun install --production

EXPOSE 3000

CMD ["bun", "run", "start"]
