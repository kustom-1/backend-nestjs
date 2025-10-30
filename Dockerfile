# Stage 1: Build the application
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Copy package files and install all dependencies
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy the rest of the source code
COPY . .

# Build the application
RUN pnpm run build

# Stage 2: Create the production image
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Copy package files and install dependencies (including dev dependencies for ts-node)
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy the built application from the build stage
COPY --from=build /usr/src/app/dist ./dist

# Copy source files and tsconfig needed for seeding
COPY --from=build /usr/src/app/src ./src
COPY --from=build /usr/src/app/tsconfig.json ./tsconfig.json

# Expose the port the app runs on
EXPOSE 3000

# Command to run seed and then start the application
CMD ["sh", "-c", "pnpm run seed && pnpm run start:dev"]
