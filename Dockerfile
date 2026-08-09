# Этап 1: Сборка фронтенда
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Этап 2: Сборка и запуск бэкенда
FROM node:22-alpine AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build
# Удаляем dev-зависимости после сборки
RUN npm ci --omit=dev

# Копируем собранный фронтенд в папку, которую будет раздавать Express
COPY --from=frontend-builder /app/frontend/dist /app/backend/public

EXPOSE 4010
CMD ["node", "dist/index.js"]
