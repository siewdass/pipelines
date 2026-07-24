# Changelog

Todos los cambios notables en este proyecto, organizados por fecha.

---

## 2026-07-24

### Eliminado
- NestJS API (`api/`) — reemplazado completamente por Management

### Agregado
- Management como servicio principal (port 4000)
- Origin validation con `NODE_ENV` (production rechaza orígenes no registrados)
- Runtime loader.js acepta `baseUrl` query param (evita ERR_NAME_NOT_RESOLVED)
- Login devuelve `name` del usuario
- `.env.example` por cada servicio (management, storage, runtime, studio, raíz)
- `CHANGELOG.md`
- `DOCS.md` con arquitectura, flujos de datos y SDK reference
- `README.md` con instrucciones de setup
- `TODO.md` organizado por módulo

### Modificado
- Storage: `bcrypt` → `bcryptjs` (sin compilación nativa)
- docker-compose: management toma port 4000 (antes 4004)
- docker-compose: eliminado servicio `api`
- docker-compose: `NODE_ENV=development` en todos los servicios
- docker-compose: `--config.allow-builds=true` en pnpm install (reemplaza pnpm-workspace.yaml)
- Studio proxy apunta a `management:4000` (antes `api:4000`)
- Studio: features se actualizan después de enviar prompt (await Promise.all)
- Features endpoint lee de la última source, no solo del build compilado
- Toaster position: top-center
- Formularios: `.horizontal-layout > *` con `flex: 1`
- `.gitignore`: ignora `.env` pero permite `.env.example`
- Eliminados `pnpm-workspace.yaml` de runtime y storage
- Eliminado `runtime/.gitignore` (redundante)
- Eliminado `runtime/DOCS.md` (integrado en DOCS.md raíz)

### Fixed
- Features no se actualizaban después de enviar prompt en Assemble
- Preview mostraba ERR_NAME_NOT_RESOLVED (runtime:4002 no resolvía en browser)
