# Use official Node.js image as the base
FROM node:18-alpine 

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Build the React app
RUN npm run build

# Use Nginx to serve the static files
FROM nginx:alpine

# Copy the built files to Nginx's default HTML directory
COPY --from=0 /app/dist /usr/share/nginx/html

# Expose port 5173 (or 80 if using Nginx)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
