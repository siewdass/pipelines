# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│  ┌──────────────────┐     ┌──────────────────────────────┐  │
│  │  Studio (:4003)  │     │  Built App (from Runtime)    │  │
│  │  React/Vite      │     │  React SDK + Generated Code  │  │
│  └────────┬─────────┘     └──────────────┬───────────────┘  │
│           │                              │                  │
└───────────┼──────────────────────────────┼──────────────────┘
            │                              │
            ▼                              ▼
┌───────────────────────┐   ┌──────────────────────────────┐
│  Management (:4000)   │   │  Identity (:4010)            │
│  Express + Mongo      │   │  Express + Mongo             │
│  Accounts, Projects,  │──►│  User Auth (signup/signin),  │
│  Assemble             │   │  Users/Roles/Permissions     │
└───────────┬───────────┘   └──────────────┬───────────────┘
            │                              │
            │       ┌──────────────────────┼──────────────────────┐
            ▼       ▼                      ▼                      ▼
┌───────────────────────┐   ┌──────────────────────────────┐   ┌───────────────┐
│  Storage (:4001)      │   │  Assets (:4012)              │   │  MongoDB      │
│  Express              │   │  Express + Multer            │   │  (Atlas)      │
│  Inquiry/Mutation     │   │  Upload/GET/DELETE           │   │  default DB:  │
│  (protected)          │   │  (public/private, allowlist) │   │  accounts,    │
└───────────┬───────────┘   └──────────────┬───────────────┘   │  projects     │
            │                              │                    │  project DBs: │
            │       ┌──────────────────────┼────────────────────┼───────────────┘
            ▼       ▼                      ▼                    ▼
┌───────────────────────┐   ┌────────────────────────┐        ┌───────────────┐
│  Events (:4013)       │   │  Volume assets_uploads │        │  users, roles,│
│  SocketCluster 20     │   │                        │        │  permissions, │
│  Realtime (protected) │   │                        │        │  builds, ...  │
└───────────────────────┘   └────────────────────────┘        └───────────────┘
```

Nota: el loader del Runtime sirve como gateway de desarrollo — inyecta `window.PIPELINES = { token, identity, storage, assets, events }` y el SDK apunta a `storage` (inquiry/mutation), `identity` (auth), `assets` (archivos) y `events` (realtime). En producción un proxy (nginx) enruta los cuatro; el realtime conecta directo a `events`.

## Service Responsibilities

### Studio (port 4003) — Frontend

React/Vite SPA. The main interface for managing projects. Uses:
- **React Query** (`useQuery`, `useMutate`) for data fetching and cache invalidation
- **Zustand** for auth state (`useAuthStore`)
- **React Router v7** for routing
- **Tailwind CSS v4** for styling
- **Vite dev proxy** routes `/api/*` calls to the appropriate backend service

Key pages:
- `/signin`, `/signup` — Account authentication
- `/projects` — List projects
- `/projects/create` — Create project
- `/projects/settings/:id` — Project config (origins, email, tokens)
- `/projects/schema/:id` — Database schemas/tables
- `/projects/projectdata/:id/:table` — Browse collection data
- `/projects/assemble/:id` — AI code generation interface
- `/projects/users/:id` — User/role/permission management

### Management (port 4000) — Backend API

Express + native MongoDB driver. Handles all management operations.

**Routes:**
- `/authentication/*` — Account register/login
- `/project/*` — Project CRUD, origins, email settings, token management (crear proyecto llama a `POST {identity}/user/seed`)
- `/database/*` — Schema listing, document fetching with association expansion
- `/source/*` — Source code versioning
- `/assemble/*` — AI code generation (Mistral/Groq), source compilation (esbuild)

**Middleware:**
- Account JWT validation (project management)
- Project JWT validation (project-scoped operations)
- Origin validation (production: reject unregistered, development: allow all)

### Identity (port 4010) — User Auth & Permissions

Microservicio de usuarios/roles/permisos extraído de management.

**Endpoints:**
- `/auth/signup`, `/auth/signin` — User auth within a project (JWT con `permissions` embebidas)
- `/user`, `/user/:id`, etc. — CRUD de usuarios (13 rutas)
- `/user/roles`, `/user/roles/permissions` — CRUD de roles y permisos
- `/user/seed` — Seed del admin delegado por management (escribe en la DB del proyecto)

**Primer login:** si el usuario no tiene password, el signin lo hashea y guarda (`firstLogin: true` en la respuesta).

### Storage (port 4001) — Runtime Data Layer

What end-user apps (built via Assemble) use. Separate from the management API.

**Endpoints:**
- `/inquiry/index`, `/inquiry/retrieve` — Read operations (filters, sort, pagination, nested expansion)
- `/mutation/upsert`, `/mutation/purge` — Write operations (with audit, unique checks, cascading)

**Acceso por source (`schemas`):** `public` → cualquiera puede leer/escribir (sin permisos); `private` → se exige token de usuario con `permissions[source][read|write]` (wildcard `*` = all_access) según la operación; sin usuario o sin permiso → 403.

**Fuentes protegidas:** `user`, `users`, `role`, `roles`, `permission`, `permissions`, `assets` son rechazadas con 403 en inquiry/mutation.

### Events (port 4013) — Realtime

SocketCluster 20 (SC) sin Express (HTTP plano). El SDK de las apps conecta directo a `events` (vía `window.PIPELINES.events`).

- RPC `authenticate { projectToken, userToken }` — decodifica JWT account/user, liga el socket al proyecto y guarda sus permisos
- Canales nativos `{projectId}:{source}:{channel}` (source vacío → `{projectId}::{channel}`); el subscribe requiere que el `projectId` del canal coincida con el del socket autenticado; `useSubscription({ channel, source })` hace `socket.subscribe(channelName)`
- RPC `publish { channel, input, source }` — si hay `source`, valida acceso `write`, persiste (`saveAndPrune`, máx 1000 docs por canal, campo `_channelId`) y emite a todos los suscritos al canal
- Acceso por source (`schemas`): `public` → cualquiera; `private` → permiso `read` (subscribe) o `write` (publish)
- Fuentes protegidas: publish (RPC) y subscribe (inbound middleware) con `source` protegida se bloquean

### Assets (port 4012) — File Management

Microservicio de archivos con multer + diskStorage (volumen `assets_uploads`).

**Endpoints:**
- `POST /assets/upload` — Multipart (`file`, `access`). Requiere user con `assets:write`. `access` default `public`.
- `GET /assets/:id` — Público sin auth; privado requiere `Authorization: Bearer <userJWT>` o `?token=<userJWT>` (para `<img>`).
- `DELETE /assets/:id` — Requiere user con `assets:write`.

**Allowlist de mimetypes:** `image/*`, `video/*`, `audio/*`, PDF, Office (Word/Excel/PPT + openxml), `text/*`, CSV. `kind` se deriva (`image|video|audio|document`); tipos no permitidos → 400.

### Runtime (port 4002) — App Server

Serves compiled app bundles. Two components:

**Server** (`server.ts`) — Express routes:
- `/serve/html?project-id=<jwt>` — Returns HTML shell with SDK loader
- `/serve/loader.js?project-id=<jwt>` — Dynamic JS that loads Tailwind, fonts, runtime.js, and app code
- `/serve/runtime.js` — Pre-built React SDK bundle
- `/serve/?project-id=<jwt>` — Returns compiled app code from MongoDB

**Client SDK** (`index.ts` → `dist/runtime.js`) — React bundle exposed on `window`:
- `window.React`, `window.ReactDOM`
- `window.Network` — HTTP/Socket clients for Storage API
- `window.Interface` — UI components (Form, Table, Dialog, Toast, etc.)
- `window.View` — Router
- `window.Bootstrap(App)` — Mounts the app

### Catalog (Fase 1 — solo datos)

Paquete `catalog/` que genera 8 catálogos normalizados como JSON en `catalog/data/` (gitignored) con `pnpm build` (--all) / `pnpm build:type --type=<name>`:

- Continentes (7), países (250), estados (5308), ciudades (156025), monedas (179), idiomas (368), timezones (315), códigos telefónicos (229)
- Formato único `{ _id, name, code, parentCode? }`; `_id` = uuid v5 determinista (`uuidv5("tipo:code")`) → salida estable/idempotente
- `parentCode` como única relación jerárquica (country→continente, state→país, city→state), con integridad referencial validada (0 huérfanos)
- `languages` con variantes por región en el `code` (`es_ES`/`es_US`); `timezones` con `name` amigable (mainCities) y `code` IANA; `phoneCodes` agrupados por dial (`+1` → United States)

**Fase 2 (listo):** `pnpm seed` importa los JSON a MongoDB (`mongodb://localhost:27017/catalog`, upsert por `_id`, índices `code`/`parentCode`) y API REST (Express, :4014, CORS abierto de solo lectura) con todo en `/`:

- `GET /` — tipos disponibles con conteo de docs
- `GET /?type=countries` — listado con filtros `?parentCode=` (jerarquía: countries→continente, states→país, cities→state), `?name=` (regex) y paginación `limit`/`skip`
- `GET /?type=countries&code=MX` — documento por código

**Pendiente:** resolución de idioma por IP/locale (Accept-Language).

### Runtime SDK Reference

#### Setup

```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="./dist/runtime.js"></script>
<div id="root"></div>
<script>
  window.PIPELINES = { TOKEN: "project-jwt-token" };
  const { Main } = window;
  ReactDOM.createRoot(document.getElementById('root')).render(<Main><App /></Main>);
</script>
```

#### Network — Data & Auth

```js
const { useInquiry, useMutation, useSubscription, usePublish, useAuthentication } = window.Network;

// Read (auto-refreshes via Socket)
const [items, loading, pagination] = useInquiry({
  source: "inventory", type: "retrieve",
  output: { id: 1, stock: 1, name: 1 },
  options: { filter: { status: 'active' }, limit: 10 }
});

// Write (invalidates queries automatically)
const [save, saving] = useMutation({
  source: "inventory", type: "upsert", refresh: ["inventory"]
});
save({ id: "123", stock: 100 }, (res) => res.success && alert("Saved"));

// Realtime subscription
const chatMessages = useSubscription({ source: "chat", filter: { id: "general" } });
const publish = usePublish({ source: "chat", options: { id: "general" } });
publish({ text: "Hello!", from: "User1" });

// Auth
const { isLogged, signin, signup, signout, loggedUser } = useAuthentication();
```

#### View — Router

```js
const { useRouter, useRoutes } = View.Router;
const routes = [
  { path: "/", element: <Home />, title: "Home" },
  { path: "/app", element: <Dashboard />, title: "Dashboard" }
];
return useRoutes(routes);

const { navigate, setQuery } = useRouter();
setQuery({ status: "active" }); // ?status=active
navigate('/app');
```

#### Interface — UI Components

- `Interface.Form` — `useForm(schema)` returns `[submit, FormComponent, values, isValid]`
- `Interface.Theme` — `useTheme()` returns `{ theme, toggleTheme }`
- `Interface.Sidebar` — `useSidebar()` returns `{ isExpanded, toggleSidebar }`
- `Interface.Breadcrumbs` — Auto-generated navigation paths
- `Interface.Table`, `Interface.Dialog`, `Interface.Tabs`, `Interface.Notification`
- `Interface.Icons` — FontAwesome 6
- `window.Utils.cn` — Tailwind class concatenation

## Data Flow

### 1. Account Registration & Login

```
Browser → POST /authentication/account/login → Management
Management validates credentials → returns JWT (contains accountId)
Browser stores JWT in localStorage
```

### 2. Project Creation

```
Browser → POST /project/create → Management
Management creates:
  1. Project document in default.projects
  2. Project database (<projectId>)
  3. Admin role + user in project DB
  4. Default origin (localhost)
  5. Schema entry in default.schemas
Returns project token (JWT containing projectId + accountId)
```

### 3. AI Code Generation (Assemble Flow)

```
User types prompt in Studio →
  POST /assemble/prompts → Management
    1. Fetches prompt history from project DB
    2. Sends to AI (Mistral → Groq fallback)
    3. AI returns { message, code, features } via tool_call
    4. Saves prompt to project DB
    5. Saves source (code + features) to project DB
    6. Returns response + features to Studio
Studio displays response, refetches features
```

### 4. Build & Preview

```
User clicks "Build" in Studio →
  POST /assemble/compile/:projectId → Management
    1. Reads source code from sources collection
    2. Compiles JSX → IIFE via esbuild
    3. Saves compiled code to builds collection
Studio opens preview iframe →
  GET /serve/html?project-id=<jwt> → Runtime
    Returns HTML with window.PIPELINES_API = browser origin
  HTML loads loader.js → Runtime
    loader.js loads: Tailwind CDN → fonts → runtime.js → app code
  GET /serve/?project-id=<jwt> → Runtime
    Returns compiled JS from builds collection
  window.Bootstrap(App) mounts the React app
```

### 5. Built App Runtime

```
Built app (in browser) →
  User auth: POST /auth/signin → Identity (Authorization/x-project-id)
  Data ops: POST /mutation/upsert, /inquiry/retrieve → Storage
  Realtime: SocketCluster subscribe → Events
  Assets: POST /assets/upload, GET/DELETE /assets/:id → Assets
```

Endpoint routing de las apps: `window.PIPELINES` inyecta `identity`, `storage`, `assets` y `events`; el SDK usa `authApi` (identity) para signup/signin, `api` (storage) para inquiry/mutation, `socket` (events) para realtime y `assets` para archivos.

## Authentication Flow

Two token types:

**Account JWT** — Created at login. Contains `accountId`. Used for:
- Managing projects (`/project/*`)
- Studio session (stored in localStorage)

**Project JWT** — Created per project. Contains `projectId` + `accountId`. Used for:
- Project-scoped operations in Studio
- End-user app authentication (sent as `x-project-id` header)

**User JWT** — Created per user within a project via Identity signin. Contains `userId`, `email` and `permissions` embedded. Used for:
- CRUD operations on project data via Storage
- File operations via Assets
- Sent as `Authorization: Bearer <token>` header

## Database Isolation

Each project gets its own MongoDB database via `mongoose.createConnection().useDb(projectId)`:
- **Default DB** (`default`): accounts, projects, origins, schemas
- **Project DB** (`<projectId>`): users, roles, permissions, builds, sources, prompts, custom collections
- **Catalog DB** (`catalog`): catálogos globales (importada con `pnpm seed` desde `catalog/data/`)
