FROM node:22-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy all source files (needed for local path linking)
COPY apps ./apps
COPY packages ./packages

# Install all dependencies
RUN pnpm install

# Install the entrypoint outside /app so the `.:/app` bind mount can't shadow it.
COPY dev-entrypoint.sh /usr/local/bin/dev-entrypoint.sh
RUN chmod +x /usr/local/bin/dev-entrypoint.sh

# The entrypoint builds libs, runs migrations (api), then starts turbo dev.
ARG APP_NAME
ENV TARGET_APP=${APP_NAME}
ENTRYPOINT ["/usr/local/bin/dev-entrypoint.sh"]
