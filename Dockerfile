# Stage 1: Build the application
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Copy package files and install all dependencies
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy the rest of the source code
COPY . .

# Run tests
RUN pnpm run test:unit:cov

# Build the application
RUN pnpm run build

# Stage 2: Create the production image
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Copy package files and install only production dependencies
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod

# Copy the built application from the build stage
COPY --from=build /usr/src/app/dist ./dist

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]
