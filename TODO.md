# TODO

Estado actual del proyecto. Lo que está hecho y lo que falta.

---

## Completado

### Infraestructura
- [x] Docker Compose con 4 servicios + MongoDB
- [x] Healthchecks, volumes, hot-reload en desarrollo
- [x] NODE_ENV configurado en todos los servicios
- [x] .env.example por cada servicio (management, storage, runtime, studio)

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
- [x] Auth de usuarios dentro de proyectos (signup/signin)
- [x] CRUD con asociaciones (one-to-one, one-to-many, many-to-many)
- [x] Upload/descarga de archivos
- [x] Socket.IO realtime con auth dual

### Runtime (port 4002)
- [x] Sirve bundles compilados (runtime.js, loader.js, app code)
- [x] loader.js acepta `baseUrl` query param para evitar ERR_NAME_NOT_RESOLVED
- [x] HTML shell dinámico con Bootstrap

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

---

## Pendiente

### Management
- [ ] Rate limiting en endpoints públicos (login, registro)
- [ ] Logs estructurados (Winston o Pino en vez de console.log)
- [ ] Tests unitarios (Jest)
- [ ] Tests de integración (E2E)

### Storage
- [ ] Mejorar funcionalidad de realtime y renombrar el servicio

### Studio
- [ ] UI para mutaciones manuales complejas (/mutation/upsert, purge masivos)
- [ ] Importar/exportar esquemas y datos
- [ ] Catálogos jerárquicos dependientes pre-cargados (Países → Estados → Ciudades)
- [ ] Dashboard con métricas reales (actualmente usa datos placeholder)
- [ ] Versionado del runtime y mostrar versión en la UI
- [ ] Branding "Powered by Pipelines" en apps generadas

### Infraestructura
- [ ] Dockerfiles optimizados para producción (multi-stage builds)
- [ ] CI/CD (GitHub Actions): tests + lint en cada PR
- [ ] Linter/formateador (ESLint/Prettier) con pre-commit hooks (Husky)
- [ ] Scripts de seeding para base de datos local
- [ ] Despliegue a producción (frontend → Vercel/Netlify, backend → Render/Railway/AWS)
