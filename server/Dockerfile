FROM alpine:3.21

# Workdir
WORKDIR /app

# Install curl, bash, and build tools (for native deps like bcrypt), plus CA certs
RUN apk add --no-cache \
	curl \
	bash \
	ca-certificates \
	python3 \
	build-base

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV BUN_INSTALL="/root/.bun"
ENV PATH="$BUN_INSTALL/bin:${PATH}"

# Install dependencies
COPY package.json ./
RUN bun install

# Copy app source
COPY . .

# Environment
ENV NODE_ENV=production
ENV PORT=7034

# Expose internal app port
EXPOSE 7034

# Start the server
CMD ["bun", "server.js"]
