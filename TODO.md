# Estado del Proyecto: Pipelines

Esta lista de tareas (TODO) ayuda a visualizar qué componentes están terminados, cuáles están pendientes y qué integraciones faltan entre la API (NestJS) y la App (React/Vite).

## 🚀 Fase 1: Backend API (NestJS)

### ✅ Completado (Según README y código actual)
- [x] Configuración inicial de NestJS.
- [x] Conexión a MongoDB (usando Mongoose).
- [x] **Módulo de Autenticación (`/authentication`)**: Registro, Login, Recuperación y Restablecimiento de contraseña.
- [x] **Módulo de Autorización (`/authorization`)**: Middleware para validación de tokens JWT.
- [x] **Módulo de Usuarios (`/user`)**: Operaciones CRUD, gestión de roles y permisos.
- [x] **Módulo de Cuentas (`/account`)**: Registro y Login para cuentas de administrador.
- [x] **Módulo de Proyectos (`/project`)**: Creación dinámica de proyectos y gestión de bases de datos aisladas.
- [x] **Módulo de Consultas (`/inquiry`)**: Recuperación de documentos con filtros, ordenamiento y paginación (`index`, `retrieve`).
- [x] **Módulo de Mutaciones (`/mutation`)**: Inserciones, actualizaciones (`upsert`) y eliminaciones (`purge`) con soporte para relaciones uno-a-uno, uno-a-muchos y muchos-a-muchos. (Maneja payloads dinámicos por diseño).

### 🚧 En Progreso / ❌ Pendiente
- [x] Implementar validaciones estrictas (Pipes/DTOs) en módulos core (`Authentication`, `Account`, `Project`). *(Inquiry y Mutation no requieren validaciones de payload por ser motores dinámicos).*
- [x] Documentación de API (Swagger/OpenAPI): Implementado en `main.ts` en la ruta `/docs`.

### 🚧 En Progreso / ❌ Pendiente
- [ ] Implementar control de tasa (Rate Limiting) para endpoints públicos (ej. Login/Registro).
- [ ] Configurar variables de entorno robustas (`.env`) para distintos ambientes (Desarrollo, Staging, Producción).
- [ ] Configurar logs estructurados (Winston o Pino en lugar del `ConsoleLogger` inicial).
- [ ] Añadir pruebas unitarias (Unit Tests) para los controladores y servicios principales (Jest).
- [ ] Añadir pruebas de integración (E2E Tests) para flujos críticos (ej. Login -> Mutación de datos -> Consulta).

---

## 🎨 Fase 2: Frontend App (React + Vite)

### ✅ Completado
- [x] Configuración inicial (Vite, React, Tailwind CSS).
- [x] Creación de sistema de Iconos y Contextos visuales (`ThemeContext`, `SidebarContext`).
- [x] **Enrutamiento (Routing)**: Implementación de Layouts (Auth & Dashboard) y rutas protegidas en `App.tsx`.
- [x] **Estado Global / Contexto**: Manejo de autenticación robusto mediante **Zustand** (`useAuthStore`).
- [x] **Interceptor de peticiones HTTP**: Client `api.ts` inyectando tokens de autenticación y de proyecto dinámicamente (`x-project-id`).
- [x] **Integración de Autenticación**: Formularios interactivos (Login/Registro) con callbacks y redirecciones.
- [x] **Manejo Centralizado de Errores/Notificaciones**: Sistema global `useToast` (Sonner).
- [x] **Dashboard y Vistas Core**: 
  - Vista general de Proyectos, creación y edición (`ProjectDetails.tsx`).
  - Representación de bases de datos/esquemas (`DataGrid` vertical en `ProjectData.tsx`).
- [x] **Generación Dinámica de Formularios/Hooks**: Uso intensivo de abstracciones como `useFetch`, `useMutate`, y `useForm` para interactuar con la API estructurada.

### 🚧 En Progreso / ❌ Pendiente
- [ ] Interfaz gráfica extendida para manejar Mutaciones manuales complejas (`/mutation/upsert`, purge masivos).
- [ ] Opciones para importar/exportar esquemas y datos del frontend al backend dinámico.
- [ ] Implementar catálogos jerárquicos dependientes pre-cargados (ej. Países -> Estados -> Ciudades) en las interfaces de creación de cuentas de los proyectos hijos.

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
