# Use official Node.js image
FROM node:18-alpine 

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy backend code
COPY . .

# Expose backend port (e.g., 5000)
EXPOSE 5000

# Start the backend server
CMD ["node", "server.js"]