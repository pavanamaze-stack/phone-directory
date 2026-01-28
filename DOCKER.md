# Docker Setup – Phone Directory

Run the full app (backend, frontend, MongoDB) with Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Quick start

From the project root:

```bash
docker compose up --build
```

- **Frontend:** http://localhost:3000  
- **Backend API:** http://localhost:5000  
- **MongoDB:** localhost:27017 (internal)

Use **http://localhost:3000** in the browser.

## Commands

| Command | Description |
|--------|-------------|
| `docker compose up --build` | Build images and start all services |
| `docker compose up -d` | Start in background |
| `docker compose down` | Stop and remove containers |
| `docker compose down -v` | Stop and remove containers + volumes |

## Default login (after first start)

Seed creates:

- **Admin:** admin@example.com / admin123  
- **User:** user@example.com / user123  

Change these in production.

## Environment variables

Create a `.env` in the project root to override defaults:

```env
JWT_SECRET=your-strong-secret-here
```

Or set when running:

```bash
JWT_SECRET=mysecret docker compose up -d
```

## Project layout

| Path | Role |
|------|------|
| `backend/Dockerfile` | Backend image (Node.js) |
| `frontend/Dockerfile` | Frontend image (build + nginx) |
| `frontend/nginx.conf` | Nginx config, proxies `/api` to backend |
| `docker-compose.yml` | Backend, frontend, MongoDB services |

## Services

1. **mongodb** – Mongo 7, port 27017, volume for data  
2. **backend** – Express API on 5000, runs seed on start  
3. **frontend** – Built React app served by nginx on 80 (mapped to 3000)  

Frontend `/api` is proxied to the backend container.

## Build or run a single service

```bash
# Backend only
docker compose up --build backend

# Frontend only (backend must be running for API)
docker compose up --build frontend

# Rebuild after code changes
docker compose up --build
```

## Volumes

- `mongodb_data` – MongoDB data
- `backend_uploads` – Uploaded CSV files

Data is kept across `docker compose down` unless you use `docker compose down -v`.
