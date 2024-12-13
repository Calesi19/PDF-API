# Stage 1: Build the application
FROM node:22-alpine AS build

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the TypeScript configuration file and the source code
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript to JavaScript
RUN npx tsc

# Stage 2: Create the production image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy compiled JavaScript from the build stage
COPY --from=build /usr/src/app/dist ./dist

# Expose the application port (default Express port is 3000)
EXPOSE 3000

# Set the default command to run the app
CMD ["node", "dist/index.js"]

