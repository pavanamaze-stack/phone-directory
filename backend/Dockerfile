# Phone Directory Backend
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy application source
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Entrypoint: seed then start server (script is included in COPY . .)
RUN chmod +x docker-entrypoint.sh
EXPOSE 5000
ENTRYPOINT ["./docker-entrypoint.sh"]
