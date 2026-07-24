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
| Storage | http://localhost:4001 | Runtime data layer for built apps |
| Runtime | http://localhost:4002 | Serves compiled app bundles |
| MongoDB | localhost:27017 | Database |

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
  storage/        Runtime data layer (CRUD, auth, realtime for built apps)
  runtime/        Serves compiled app bundles + React SDK
  studio/         Frontend UI (React + Vite)
```

### Services Overview

**Studio** (`:4003`) — React/Vite frontend. Uses React Query, Zustand, Tailwind CSS. Proxies API calls via Vite dev server to the appropriate backend.

**Management** (`:4000`) — Express backend. Handles account auth, project management, user/roles/permissions CRUD, AI code generation (Assemble), source compilation, database queries, and schema management.

**Storage** (`:4001`) — The runtime data layer that end-user apps (built via Assemble) use for user authentication, CRUD operations, file uploads, and realtime via Socket.IO.

**Runtime** (`:4002`) — Serves compiled app bundles. When an app is built, this service generates the HTML shell, loads the React SDK (runtime.js), fetches the compiled code from MongoDB, and mounts it in the browser.

**MongoDB** (`:27017`) — Shared database. Each project gets its own isolated database.

## Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `MISTRAL_API_KEY` | Management | Mistral AI API key for code generation |
| `GROQ_API_KEY` | Management | Groq API key (fallback AI provider) |

Internal variables (set in docker-compose.yml, no need to change for local dev):

| Variable | Description |
|----------|-------------|
| `PORT` | Service port (4000-4002) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | MongoDB connection string |
| `ACCOUNT_JWT_SECRET` | Secret for account JWT tokens |
| `USER_JWT_SECRET` | Secret for user JWT tokens |
| `UPLOADS_DIR` | File upload directory (Storage) |

## Development

All services run with hot-reload in development. Edit files locally and changes are reflected immediately (except the Runtime server, which requires a container restart):

```bash
docker restart pipelines-runtime-1
```

## Building for Production

Currently development-only. Production builds are pending (see [TODO.md](TODO.md)).
