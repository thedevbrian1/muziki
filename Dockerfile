ARG NODE_VERSION=22.11.0

# Adjust NODE_VERSION as desired
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Remix"

# Remix app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl sqlite3

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /myapp

ADD package.json package-lock.json .npmrc ./
RUN npm install --production=false
RUN npm install cross-env --save-dev

# Setup production node_modules
FROM base as production-deps

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules
ADD package.json package-lock.json .npmrc ./
RUN npm prune --production

# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
COPY package-lock.json package.json ./
RUN npm ci --include=dev

# Copy application code
COPY . .

ADD prisma .
RUN npx prisma generate

# Build application
RUN npm run build

# Remove development dependencies
RUN npm prune --omit=dev


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "npm", "run", "start" ]

ENTRYPOINT [ "./start.sh" ]

















# FROM node:${NODE_VERSION}-slim AS base

# LABEL fly_launch_runtime="Remix"

# # Install openssl for Prisma
# RUN apt-get update && apt-get install -y openssl sqlite3

# FROM base AS development-dependencies-env
# COPY . /app
# WORKDIR /app
# RUN npm ci

# FROM base AS production-dependencies-env
# COPY ./package.json package-lock.json /app/
# WORKDIR /app
# RUN npm ci --omit=dev

# FROM base AS build-env
# COPY . /app/
# COPY --from=development-dependencies-env /app/node_modules /app/node_modules
# COPY prisma /app/prisma
# WORKDIR /app

# RUN npx prisma generate

# RUN npm run build

# FROM base
# COPY ./package.json package-lock.json /app/
# COPY --from=production-dependencies-env /app/node_modules /app/node_modules
# COPY --from=build-env /app/build /app/build
# COPY ./start.sh /app/start.sh
# WORKDIR /app
# CMD ["npm", "run", "start"]

# ENTRYPOINT [ "./start.sh" ]