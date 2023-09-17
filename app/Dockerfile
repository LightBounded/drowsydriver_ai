# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or pnpm-lock.yaml) to the working directory
# COPY package.json ./
# COPY package-lock.json ./  
# Use package-lock.json if you're using npm
# or

COPY . .
# Use pnpm-lock.yaml if you're using pnpm

# Install dependencies
RUN npm install

# Copy the rest of the application files to the container

# Build the React app using Vite
RUN npm run build

# Expose the port your Vite app will run on (default is 3000)
EXPOSE 3000

# Define the command to start your Vite app in production mode
CMD ["npm", "run", "start"]
