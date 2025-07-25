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

# Copy files to prod
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/ctxdb.zip /app/ctxdb.zip


RUN bun install --production

EXPOSE 3000

CMD ["bun", "run", "start"]
