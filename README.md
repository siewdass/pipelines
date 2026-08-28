# Pipelines

Platform for building AI-generated web applications. Users describe interfaces in natural language, the AI generates JSX code, compiles it, and serves it as a standalone app.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- Git

## Quick Start

```bash
git clone <repo-url> && cd pipelines
```

Create a `.env` file in the project root:

```env
MISTRAL_API_KEY=your-mistral-key
GROQ_API_KEY=your-groq-key
MONGO_URI=mongodb://localhost:27017/default
```

Start all services:

```bash
docker compose up --build
```

The services will be available at:

| Service | URL | Description |
|---------|-----|-------------|
| Studio | http://localhost:4003 | Frontend UI (React/Vite) |
| Management | http://localhost:4000 | Backend API (Express) |
| Storage | http://localhost:4001 | Runtime data layer (inquiry/mutation) for built apps |
| Identity | http://localhost:4010 | User auth, users/roles/permissions |
| Assets | http://localhost:4012 | File management for built apps |
| Events | http://localhost:4013 | Realtime (SocketCluster 20) for built apps |
| Runtime | http://localhost:4002 | Serves compiled app bundles |
| MongoDB | Local (default) / Atlas via MONGO_URI | Database |

## Stopping

```bash
docker compose down
```

To remove volumes (resets database):

```bash
docker compose down -v
```

## Project Structure

```
pipelines/
  management/     Backend API (Express + MongoDB driver)
  storage/        Runtime data layer (inquiry/mutation for built apps)
  identity/       User auth + users/roles/permissions
  assets/         File management for built apps
  events/         Realtime (SocketCluster 20) for built apps
  catalog/        Catalog data (JSON data + REST API :4014; not in docker-compose)
  runtime/        Serves compiled app bundles + React SDK
  studio/         Frontend UI (React + Vite)
```

### Services Overview

**Studio** (`:4003`) — React/Vite frontend. Uses React Query, Zustand, Tailwind CSS. Proxies API calls via Vite dev server to the appropriate backend.

**Management** (`:4000`) — Express backend. Handles account auth, project management, AI code generation (Assemble), source compilation, database queries, and schema management. Delegates user/roles/permissions to Identity.

**Identity** (`:4010`) — User auth within projects (signup/signin with JWT + permissions) and CRUD of users, roles, and permissions. Management calls `POST /user/seed` here when creating a project.

**Storage** (`:4001`) — The runtime data layer that end-user apps use for inquiry and mutation. Protected sources (`user`, `role`, `permission`, `assets`) are rejected with 403. Permission checks are optional: no user token → public, token without permission for the source → 403.

**Assets** (`:4012`) — File management for built apps: upload/GET/DELETE with public/private access, permission checks (`assets:write`/`assets:read`), and a mimetype allowlist.

**Events** (`:4013`) — Realtime for built apps via SocketCluster 20 (no Express): subscribe/publish per source/channel, and persistence with pruning (1000 docs per channel).

**Runtime** (`:4002`) — Serves compiled app bundles. When an app is built, this service generates the HTML shell (injecting `window.PIPELINES = { token, identity, storage, assets, events }`), loads the React SDK (runtime.js), fetches the compiled code from MongoDB, and mounts it in the browser.

**MongoDB** (local por defecto; Atlas si `MONGO_URI` apunta) — Shared database. Each project gets its own isolated database.

## Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `MISTRAL_API_KEY` | Management | Mistral AI API key for code generation |
| `GROQ_API_KEY` | Management | Groq API key (fallback AI provider) |

Internal variables (set in docker-compose.yml, no need to change for local dev):

| Variable | Description |
|----------|-------------|
| `PORT` | Service port (4000-4013) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | MongoDB connection string |
| `ACCOUNT_JWT_SECRET` | Secret for account JWT tokens |
| `USER_JWT_SECRET` | Secret for user JWT tokens |
| `EVENTS_URL` | Events base URL injected into `window.PIPELINES.events` (Runtime) |
| `UPLOADS_DIR` | File upload directory (Assets) |

## Development

All services run with hot-reload in development. Edit files locally and changes are reflected immediately (except the Runtime server, which requires a container restart):

```bash
docker restart pipelines-runtime-1
```

## Building for Production

Currently development-only. Production builds are pending (see [TODO.md](TODO.md)).
