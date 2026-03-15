FROM node:20-alpine

WORKDIR /app/Backend

# Install deps first for better layer caching
COPY Backend/package*.json ./
RUN npm ci

# Copy source and build
COPY Backend/ ./
RUN npm run build && npm prune --omit=dev

ENV NODE_ENV=production

EXPOSE 4000
CMD ["npm", "start"]

