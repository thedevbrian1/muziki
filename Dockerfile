ARG NODE_VERSION=22.11.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Remix"

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl sqlite3

FROM base AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM base AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM base AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app


ADD prisma .
RUN npx prisma generate

RUN npm run build

FROM base
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
COPY ./start.sh /app/start.sh
WORKDIR /app
CMD ["npm", "run", "start"]

ENTRYPOINT [ "./start.sh" ]