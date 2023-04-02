ARG OXVIID=v0
## Base Image
FROM node:18.15.0-alpine AS base
ENV NODE_ENV=production
# Install everything into /app directory
RUN mkdir /app
WORKDIR /app
# Only copy files needed for npm install
COPY package*.json* ./
# Install production packages only using package-lock.json and clean the cache to reduce image size
RUN npm ci --omit=dev --ignore-scripts

## Development Image
FROM base AS dev
ARG OXVIID
ENV NODE_ENV=development
RUN npm ci

## Build Image
FROM dev AS build
ARG OXVIID
# Copy the code in
COPY . .
# Compile the code
RUN npm run build

## Production image
FROM base AS prod
ARG OXVIID
# Move the compiled code
COPY --from=build /app/dist/ ./
CMD ["node", "/app/main.js"]
COPY version.json /var/version.json
# add a support label to direct users to support channel
LABEL support=support@ox.security
LABEL OXVIID=$OXVIID
