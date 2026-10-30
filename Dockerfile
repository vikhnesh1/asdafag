# Multi-stage build: Frontend + Backend unified for single-service deployment
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Python 3.12 Backend with bundled Frontend SPA
FROM python:3.12-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend application
COPY backend/ ./backend/

# Copy built frontend distribution into /app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Render assigns dynamic port via $PORT (defaults to 10000)
ENV PORT=10000
EXPOSE 10000

WORKDIR /app/backend

# Run FastAPI via Uvicorn bound to dynamic $PORT
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000}"]
