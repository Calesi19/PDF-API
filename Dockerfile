# Stage 1: Build the application
FROM node:22-alpine AS build

# Set the working directory
WORKDIR /usr/src/app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application and compile
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

# Stage 2: Create the production image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy production dependencies
COPY package*.json ./
RUN npm install --production --silent

# Copy the compiled code from the build stage
COPY --from=build /usr/src/app/dist ./dist

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]

