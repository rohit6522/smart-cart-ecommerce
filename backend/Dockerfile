FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy backend application source
COPY . .

# Set default environment variables (Render automatically injects PORT)
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

# Start CartNova Node.js REST API Server
CMD ["node", "server.js"]
