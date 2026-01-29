# Connection Check – Phone Directory

Quick reference for how each part connects.

## Connection flow

```
Browser (localhost:3000)
    → Frontend (React / nginx)
    → /api/* proxied to Backend (localhost:5000)
    → Backend (Node/Express)
    → MongoDB (localhost:27017)
```

## 1. MongoDB

- **URI:** `mongodb://localhost:27017/phone-directory`
- **Used by:** Backend only.
- **Check:** Backend logs `✅ MongoDB connected successfully` on start.
- **If using Docker prod:** Backend uses `network_mode: host`, so `localhost` = host; ensure MongoDB is running on the host and (if needed) `bindIp: 0.0.0.0` in `/etc/mongod.conf`.

## 2. Backend

- **URL:** `http://localhost:5000`
- **Health:** `GET http://localhost:5000/api/health` → `{ "status": "OK" }`
- **Env:** `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL` (for CORS).
- **Listen:** `0.0.0.0:5000` so Docker/remote can reach it.

## 3. Frontend (dev – Vite)

- **URL:** `http://localhost:3000`
- **API:** Browser calls `/api`; Vite proxy sends to `http://localhost:5000`.
- **Config:** `frontend/vite.config.js` → `proxy['/api'].target = 'http://localhost:5000'`.

## 4. Frontend (prod – Docker nginx)

- **URL:** `http://localhost:3000` (port 3000 → container 80).
- **API:** Nginx `location /api` → `proxy_pass http://backend:5000`.
- **Backend reach:** `backend` resolved via `extra_hosts: backend:host-gateway` to host, so backend must be on host port 5000 (e.g. backend with `network_mode: host`).

## Quick checks

| Check              | Command / action                    |
|--------------------|-------------------------------------|
| MongoDB reachable  | `mongosh mongodb://localhost:27017` or backend startup log |
| Backend up         | `curl http://localhost:5000/api/health` |
| Frontend up        | Open `http://localhost:3000`        |
| API from frontend  | Login or any action that calls `/api` |

## Run project (no Docker)

```bash
# Terminal 1 – backend
cd backend && node server.js

# Terminal 2 – frontend
cd frontend && npm run dev
```

Then open **http://localhost:3000**.

## Run project (Docker prod)

```bash
# MongoDB running on host, then:
docker compose -f docker-compose-prod.yml up --build
```

Then open **http://localhost:3000**.
