# Stage 1: Build the React frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build the TypeScript backend
FROM node:22-alpine AS backend-build
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/ ./
RUN npx tsc

# Stage 3: Production image
FROM node:22-alpine
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev
COPY --from=backend-build /app/server/dist ./dist
COPY --from=frontend-build /app/client/dist ./public
EXPOSE 3000
CMD ["node", "dist/index.js"]


