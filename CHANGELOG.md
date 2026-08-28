# Changelog

Cada línea usa el prefijo de su intención: `Added`, `Changed`, `Fixed`, `Removed`.
Verificar la fecha actual antes de agregar una nueva entrada.

---

## 2026-08-11

- Added: `catalog` Fase 2 — seed `pnpm seed` importa `catalog/data/*.json` a MongoDB (`mongodb://localhost:27017/catalog`, upsert por `_id`, índices `code`/`parentCode`)
- Added: API REST del catálogo (Express, port 4014, CORS abierto de solo lectura) con todo en `/`: `GET /` (tipos + conteos), `GET /?type=` con filtros `parentCode`/`code`/`name` y paginación `limit`/`skip`
- Note: resolución de idioma por IP/locale y localización de countries/states quedan pendientes (TODO)

## 2026-08-06

- Changed: `events` migrado de Socket.IO a SocketCluster 20 — `socketcluster-server@^20` (attach, sin Express, path `/socketcluster/`) y cliente `socketcluster-client@^20`; auth por RPC `authenticate`, canales `{projectId}:{source}:{channel}`, persistencia `saveAndPrune` y fail-closed (si Mongo cae, publish/subscribe se bloquean, sin fallback a broadcast)
- Changed: `docker-compose.yml` — `MONGO_URI` como variable de entorno (`${MONGO_URI:-mongodb://localhost:27017/default}`), documentada en `.env.example` raíz; local por defecto, Atlas opcional

## 2026-08-06

- Added: Microservicio `catalog` (Fase 1, solo datos): 8 builders en `catalog/scripts/` que generan JSON en `catalog/data/` (gitignored) — `continents` (7), `countries` (250), `states` (5308), `cities` (156025), `currencies` (179), `languages` (368), `timezones` (315), `phoneCodes` (229)
- Added: Formato único de catálogo `{ _id, name, code, parentCode? }`; `_id` = uuid v5 determinista (`uuidv5("tipo:code")`) → salida estable/idempotente
- Added: `parentCode` como única relación jerárquica (country→continente, state→país, city→state) con integridad referencial validada (0 huérfanos)
- Added: `languages` con variantes por región en el `code` (`es_ES`/`es_US`, ~184 × 2), nombre en inglés por defecto
- Added: `timezones` con `name` amigable (mainCities) y `code` IANA (`America/Mexico_City`); `phoneCodes` agrupados por dial compartido con representante por área (`+1` → United States)
- Added: Runner `pnpm build` (--all) / `pnpm build:type --type=<name>`; devDeps: `world-countries`, `@countrystatecity/countries`, `currency-codes`, `@cospired/i18n-iso-languages`, `@vvo/tzdb`, `uuid`, `tsx`, `typescript`
- Note: `@countrystatecity/states|cities` no existen en npm — el paquete `@countrystatecity/countries` incluye countries+states+cities; `@vvo/tzdb` no incluye zonas UTC/GMT/Etc (solo 315 IANA reales)

## 2026-08-03

- Added: Microservicio `events` (port 4013, sin express): realtime extraído de storage — socket.io con `setupRealtime(httpServer)` plano, auth por handshake (`projectToken`/`userToken`), rooms por source/channel, persistencia (`saveAndPrune`/`fetchRecent`), fuentes protegidas
- Added: Permisos opcionales en storage: inquiry (`read`) y mutation (`write`) resuelven `permissions[source]` (wildcard `*` = all_access); sin token → público, con token sin permiso → 403 (`middleware/user.ts` + `middleware/permissions.ts`)
- Added: `window.PIPELINES = { token, identity, storage, assets, events }` inyectado por el runtime (/html y loader.js) y en el HTML descargado (ProjectAssemble); `events` = `EVENTS_URL` en runtime y `VITE_EVENTS_URL` en studio
- Changed: SDK `api` → `getPipelines().storage` (antes `data`); `socket` → `getPipelines().events` o `http://localhost:4013` (cableado directo, sin proxy)
- Changed: Storage queda con solo inquiry + mutation (se mantiene el nombre `storage`); se eliminan `routes/auth.ts`, `routes/assets.ts`, `services/realtime*.ts` y `middleware/user.ts` antiguo
- Removed: deps de storage `bcryptjs`, `express-rate-limit`, `multer`, `socket.io` (+ types)
- Changed: `docker-compose.yml` añade servicio `events` (4013) + `EVENTS_URL` en runtime; storage sin `UPLOADS_DIR` ni volumen `storage_uploads`
- Added: Microservicio `identity` (port 4010): signup/signin de usuarios, CRUD de usuarios/roles/permisos, `POST /user/seed` delegado por management al crear proyecto
- Added: Primer login: usuario sin password lo define al entrar (flag `firstLogin` en el signin)
- Added: Microservicio `assets` (port 4012): upload/GET/DELETE con multer, permisos `assets:read`/`assets:write`, `access` public/private (`?token=` para privado), allowlist de mimetypes con derivación de `kind`
- Added: Studio proxy de vite a `identity:4010`, `assets:4012`, `storage:4001` (/inquiry, /mutation)
- Added: `storage/src/services/protected.ts` — fuentes protegidas (`user`, `users`, `role`, `roles`, `permission`, `permissions`, `assets`) rechazadas con 403 en inquiry/mutation y realtime
- Changed: Management ya no escribe usuarios/roles/permisos (delegado a identity); `routes/user.ts` eliminado
- Changed: Storage pierde auth de usuarios (migrado a identity); SDK usa `authApi` → `/auth/signup|signin`
- Changed: `docker-compose.yml` añade servicios identity y assets + volumen `assets_uploads`; management con `IDENTITY_URL`
- Removed: SDK `BASE_URL = http://localhost:8000` (puerto muerto)

## 2026-07-24

- Added: Management como servicio principal (port 4000)
- Added: Origin validation con `NODE_ENV` (production rechaza orígenes no registrados)
- Added: Runtime loader.js acepta `baseUrl` query param
- Added: Login devuelve `name` del usuario
- Added: `.env.example` por cada servicio
- Added: `CHANGELOG.md`, `DOCS.md`, `README.md`, `TODO.md`
- Added: Rate limiting (5 req/min) en endpoints de autenticación (management y storage)
- Added: ESLint v10 flat config y reglas de estilo TS
- Added: Auto-build en el primer prompt
- Changed: Storage: `bcrypt` → `bcryptjs`
- Changed: docker-compose management toma port 4000 (antes 4004)
- Changed: docker-compose eliminado servicio `api`
- Changed: docker-compose usa Atlas directamente (MongoDB local eliminado)
- Changed: Studio proxy apunta a `management:4000`
- Changed: `.gitignore` permite `.env.example`
- Changed: Eliminados `pnpm-workspace.yaml` de runtime y storage
- Changed: Management auth routes: `require()` interno → `import` top-level
- Changed: Runtime busca builds en DB del proyecto (`useDb(projectId)`) en vez de `default`
- Changed: Storage usa `bcryptjs` en vez de `bcrypt`
- Fixed: Features no se actualizaban después de enviar prompt en Assemble
- Fixed: Preview mostraba ERR_NAME_NOT_RESOLVED
- Fixed: Runtime no encontraba builds (`No build found`) — usaba DB `default`
- Fixed: DNS `ENOTFOUND` al conectar con Atlas desde Docker
- Removed: NestJS API (`api/`)
- Removed: `management/src/types.ts` (nunca se importaba)
- Removed: `storage/pnpm-workspace.yaml` (basura)
- Removed: `uuid` dependency de runtime (no se usaba)
- Removed: `flattenPermissions` de management auth (solo se usaba en storage)
- Changed: eliminado import `uuidv4` no usado en management/source.ts
- Changed: eliminado variable `db` muerta en runtime/server.ts
- Added: auth con HttpOnly cookies (management login/logout)
- Added: endpoint `GET /authentication/me` para verificar sesión
- Added: endpoint `POST /authentication/account/logout` para limpiar cookie
- Changed: CORS permite credentials con origen específico
- Changed: Studio API client usa `withCredentials: true` en vez de header Authorization
- Changed: Studio auth store rehidrata sesión via `/me` al cargar la página
- Changed: Studio logout limpia `project-token` de localStorage
- Fixed: `loggedUser` se pería al recargar la página
- Changed: project router lee token de cookie (no solo Authorization header)
- Changed: iframe preview sin sandbox (contenido propio, no requiere restricciones)
