# Use Node.js on Debian
FROM node:20

# Set up working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (no need for the validator now)
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose only the API port
EXPOSE 3004

# Start script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Start server only
CMD ["/app/start.sh"]