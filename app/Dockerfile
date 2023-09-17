# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml (or pnpm-lock.json) to the working directory
COPY package.json .

# Use pnpm-lock.yaml if available, otherwise use pnpm-lock.json
COPY pnpm-lock.yaml .  


# Install PNPM globally (if not already installed)
RUN npm install -g pnpm

# Install dependencies using PNPM
RUN pnpm install

# Copy the rest of the application files to the container
COPY . .

# Build the React app using Vite
RUN npm run build

# Expose the port your Vite app will run on (default is 3000)
EXPOSE 3000

# Define the command to start your Vite app in production mode
CMD ["npm", "run", "start"]
