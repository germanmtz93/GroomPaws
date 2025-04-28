FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the code
COPY . .

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chmod 777 uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the port
EXPOSE 5000

# Build the frontend
RUN npm run build

# Start the server
CMD ["node", "dist/server/index.js"]