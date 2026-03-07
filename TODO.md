# Estado del Proyecto: Pipelines

Esta lista de tareas (TODO) ayuda a visualizar qué componentes están terminados, cuáles están pendientes y qué integraciones faltan entre la API (NestJS) y la App (React/Vite).

## 🚀 Fase 1: Backend API (NestJS)

### ✅ Completado (Según README y código actual)
- [x] Configuración inicial de NestJS.
- [x] Conexión a MongoDB (usando Mongoose).
- [x] **Módulo de Autenticación (`/authentication`)**: Registro, Login, Recuperación y Restablecimiento de contraseña.
- [x] **Módulo de Autorización (`/authorization`)**: Middleware para validación de tokens JWT.
- [x] **Módulo de Usuarios (`/user`)**: Operaciones CRUD, gestión de roles y permisos.
- [x] **Módulo de Clientes (`/client`)**: Registro y Login para clientes.
- [x] **Módulo de Base de Datos (`/database`)**: Creación dinámica de bases de datos y mapeo de tokens.
- [x] **Módulo de Consultas (`/inquiry`)**: Recuperación de documentos con filtros, ordenamiento y paginación (`index`, `retrieve`).
- [x] **Módulo de Mutaciones (`/mutation`)**: Inserciones, actualizaciones (`upsert`) y eliminaciones (`purge`) con soporte para relaciones uno-a-uno, uno-a-muchos y muchos-a-muchos.
- [x] **Módulo de Gestión (`/management`)**: Listado de colecciones y recuperación de datos con asociaciones anidadas.

### 🚧 En Progreso / ❌ Pendiente
- [ ] Implementar validaciones estrictas (Pipes/DTOs) en los módulos de mutación e inquiry.
- [ ] Añadir pruebas unitarias (Unit Tests) para los controladores y servicios principales (Jest).
- [ ] Añadir pruebas de integración (E2E Tests) para flujos críticos (ej. Login -> Mutación de datos -> Consulta).
- [ ] Documentación de API (Swagger/OpenAPI) - *Nota: `@nestjs/swagger` está en package.json, verificar si está implementado en `main.ts`*.
- [ ] Configurar variables de entorno robustas (`.env`) para distintos ambientes (Desarrollo, Staging, Producción).
- [ ] Implementar control de tasa (Rate Limiting) para endpoints públicos (ej. Login/Registro).
- [ ] Configurar logs estructurados (ej. Winston o Pino).

---

## 🎨 Fase 2: Frontend App (React + Vite)

### ✅ Completado
- [x] Configuración de proyecto con Vite y React.
- [x] Instalación de dependencias clave: `react-router-dom`, `primereact`, `@jsonforms/react`.
- [x] Estructura básica de vistas: `home.tsx`, `authentication.tsx`.

### 🚧 En Progreso / ❌ Pendiente
- [ ] **Enrutamiento (Routing)**: Configurar rutas protegidas (RequireAuth) y públicas usando `react-router-dom`.
- [ ] **Estado Global / Contexto**: Implementar contexto (Context API o Zustand/Redux) para manejar la sesión del usuario (Token JWT, datos del usuario).
- [ ] **Integración de Autenticación**: Conectar el formulario de `authentication.tsx` con el endpoint `POST /authentication/login` y `POST /authentication/register`.
- [ ] **Interceptor de peticiones HTTP**: Configurar Axios o fetch para inyectar automáticamente el token JWT en las cabeceras (`Authorization: Bearer <token>`) para peticiones seguras.
- [ ] **Generación Dinámica de Formularios**: Implementar `@jsonforms/react` con los renderers de Material/PrimeReact para crear formularios basados en esquemas (conectado al backend).
- [ ] **Dashboard / Vistas de Gestión**: Construir la interfaz para consumir las rutas genéricas de `/inquiry` y `/management`.
- [ ] Construir la interfaz para manejar Mutaciones (`/mutation/upsert`, `/mutation/purge`).
- [ ] Manejo centralizado de errores, alertas y notificaciones (Toast de PrimeReact) para respuestas fallidas o exitosas de la API.

---

## 🛠 Fase 3: DevOps, CI/CD y Despliegue

### ❌ Pendiente
- [ ] Configurar un archivo `.env.example` en ambos repositorios.
- [ ] Crear Dockerfiles para empaquetar la API y la App (Opcional, pero recomendado).
- [ ] Configurar un archivo `docker-compose.yml` para levantar la base de datos (MongoDB) y servicios localmente con un solo comando.
- [ ] Configurar linter y formateador (ESLint/Prettier) como pre-commit hooks (Husky).
- [ ] CI/CD: Configurar GitHub Actions (o GitLab CI) para ejecutar pruebas automáticamente en cada PR.
- [ ] Scripts para popular o limpiar la base de datos localmente (Seeding).
- [ ] Preparar el despliegue a producción (Ej. Vercel/Netlify para la App, Render/Railway/AWS para la API NestJS).
