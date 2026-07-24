# Changelog

Cada línea usa el prefijo de su intención: `Added`, `Changed`, `Fixed`, `Removed`.
Verificar la fecha actual antes de agregar una nueva entrada.

---

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
