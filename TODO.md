# TODO

Estado actual del proyecto. Lo que está hecho y lo que falta.

---

## Completado

### Infraestructura
- [x] Docker Compose con 4 servicios + MongoDB
- [x] Healthchecks, volumes, hot-reload en desarrollo
- [x] NODE_ENV configurado en todos los servicios
- [x] .env.example por cada servicio (management, storage, runtime, studio, identity, assets, events)

### Management (port 4000)
- [x] Autenticación de cuentas (register/login)
- [x] Creación de proyectos con base de datos aislada por proyecto
- [x] JWT dual: account token + project token
- [x] CRUD completo de usuarios, roles y permisos
- [x] Generación de código con IA (Mistral → Groq fallback)
- [x] Compilación de JSX via esbuild
- [x] Origen validation: production rechaza orígenes no registrados, development permite todo
- [x] Features endpoint lee de la última source, no solo del build compilado
- [x] Login devuelve name del usuario
- [x] bcryptjs reemplaza bcrypt (evita compilación nativa)

### Storage (port 4001)
- [x] CRUD con asociaciones (one-to-one, one-to-many, many-to-many)
- [x] Fuentes protegidas (user, role, permission, assets) bloqueadas en inquiry/mutation con 403
- [x] Permisos opcionales: sin token → público; con token sin permiso de la source → 403 (inquiry read, mutation write)

### Events (port 4013)
- [x] Microservicio de realtime extraído de storage (SocketCluster 20, sin express)
- [x] Auth por RPC `authenticate` (`projectToken`/`userToken`), canales nativos `{projectId}:{source}:{channel}`, subscribe ligado al projectId del socket
- [x] Persistencia con prune (1000 docs por canal); sin fallback broadcast (fail-closed: si Mongo cae, publish/subscribe se bloquean)
- [x] Acceso por source (`schemas`): `public` → cualquiera; `private` → permiso `read`/`write`; fuentes protegidas bloqueadas en publish y subscribe

### Identity (port 4010)
- [x] Microservicio de usuarios/roles/permisos extraído de management
- [x] Signup/signin de usuarios con JWT (permissions embebidas)
- [x] Primer login: usuario sin password lo define al entrar (flag `firstLogin`)
- [x] CRUD de usuarios, roles y permisos (13 rutas)
- [x] Seed del admin delegado por management (`POST /user/seed`) que escribe en la DB del proyecto

### Assets (port 4012)
- [x] Microservicio de archivos con multer + diskStorage (volumen `assets_uploads`)
- [x] Upload/GET/DELETE con permisos (`assets:write` / `assets:read`)
- [x] `access` public/private (default public); privado exige header Authorization o `?token=` (para `<img>`)
- [x] Allowlist de mimetypes (image/video/audio, PDF/Office, text/*) → 400 si no aplica

### Runtime (port 4002)
- [x] Sirve bundles compilados (runtime.js, loader.js, app code)
- [x] `window.PIPELINES = { token, identity, storage, assets, events }` inyectado en /html y loader.js
- [x] SDK: `api`→storage, `authApi`→identity, socket→events (endpoints configurables vía window.PIPELINES)
- [x] Red: `socketcluster-client` (sin `socket.io-client`), sin `refresh`, RPCs `authenticate`/`publish`

### Studio (port 4003)
- [x] Sistema de autenticación (login/registro de cuentas)
- [x] CRUD de proyectos (crear, editar, configurar)
- [x] Gestión de orígenes (whitelist de dominios por proyecto)
- [x] Configuración de email por proyecto
- [x] Gestión de usuarios, roles y permisos por proyecto
- [x] Explorador de esquemas/colecciones de la base de datos
- [x] Navegador de datos con expansión de asociaciones
- [x] Assemble: interfaz de chat con IA para generar código
- [x] Assemble: compilación de JSX → IIFE via esbuild
- [x] Assemble: preview embebido (iframe con loader.js)
- [x] Assemble: features se actualizan después de enviar prompt (sin F5)
- [x] Assemble: dropdown de versiones de código fuente
- [x] Descarga de index.html para despliegue
- [x] Toaster position top-center
- [x] Formularios con layout horizontal correcto (flex: 1 en campos)
- [x] Proxy de vite a identity (4010), storage (4001) y assets (4012)

### Catalog (nuevo, Fase 1 — solo datos JSON)
- [x] Builders → JSON en `catalog/data/` (gitignored): continents (7), countries (250), states (5308), cities (156025), currencies (179), languages (368), timezones (315), phoneCodes (229)
- [x] Formato único `{ _id, name, code, parentCode? }`; `_id` = uuid v5 determinista (`uuidv5("tipo:code")`)
- [x] `parentCode` como única relación jerárquica (country→continente, state→país, city→state); 100% referencial
- [x] `languages` con variantes por región en el `code` (`es_ES`/`es_US`), nombre en inglés default
- [x] `timezones` con `name` amigable (mainCities) y `code` IANA; `phoneCodes` agrupados por dial (`+1` → United States)
- [x] Fuentes: `world-countries`, `@countrystatecity/countries`, `currency-codes`, `@cospired/i18n-iso-languages`, `@vvo/tzdb`
- [x] Runner `pnpm build` (--all) / `pnpm build:type --type=<name>`; tsc y eslint limpios

### Catalog (Fase 2 — seed a MongoDB + API REST)
- [x] Seed `pnpm seed`: importa `catalog/data/*.json` a MongoDB (`mongodb://localhost:27017/catalog`), upsert por `_id` (uuid v5) con índices `code`/`parentCode`
- [x] API REST (Express, :4014): `GET /?type=` con filtros `parentCode` (jerarquía), `code`, `name` (regex) y paginación `limit`/`skip`; `GET /` (tipos con conteo); `GET /health`
- [x] CORS abierto (datos públicos de solo lectura)

---

## Pendiente

### Management
- [x] Rate limiting en endpoints públicos (login, registro)
- [x] Auto-build en primer prompt
- [ ] Módulo de logs en management, persistidos y visibles desde Studio (no winston/pino a nivel de cliente)

### Storage
- [x] Acceso por source public/private (colección `schemas` como metadata)
- [x] Realtime movido a `events` (eliminado Socket.IO/realtime-gateway de storage)

### Studio
- [ ] UI para mutaciones manuales complejas (/mutation/upsert, purge masivos)
- [ ] Importar/exportar esquemas y datos
- [ ] Dashboard con métricas reales (actualmente usa datos placeholder)
- [ ] Versionado del runtime y mostrar versión en la UI

### Runtime
- [ ] Branding "Powered by Pipelines" en apps generadas (agregar al runtime/loader)

### Catalog
- [ ] Resolución de idioma por IP/locale en la API (Accept-Language)
- [ ] Localizar countries/states con el mismo patrón de `languages` (variantes por región) cuando haya fuente
- [ ] Catálogo personalizado (el cliente define catálogos propios vía management/API)
