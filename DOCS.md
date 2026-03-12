# Pipelines

Este proyecto consta de dos componentes principales: una API backend construida con NestJS y una aplicación frontend.

## API

La API está desarrollada con NestJS y utiliza MongoDB para el almacenamiento de datos. Proporciona endpoints para autenticación, autorización, mutaciones de datos, consultas, gestión de esquemas y más.

### Módulos

#### Authentication
Maneja el registro de usuarios, inicio de sesión, recuperación de contraseña y restablecimiento.

- `POST /authentication/register`: Registra un nuevo usuario.
- `POST /authentication/login`: Inicia sesión de un usuario.
- `POST /authentication/recover`: Inicia el proceso de recuperación de contraseña.
- `PATCH /authentication/save`: Guarda/restablece la contraseña.

#### Authorization
Middleware que valida tokens JWT y establece el userId en la solicitud.

#### Client
Similar al módulo de autenticación, pero para clientes.

- `POST /client/register`: Registra un nuevo cliente.
- `POST /client/login`: Inicia sesión de un cliente.

#### Database
Gestiona la creación de bases de datos y el mapeo de tokens a nombres de base de datos.

- `POST /database/create`: Crea una nueva base de datos y mapea un token.

#### Inquiry
Permite recuperar datos con filtrado, ordenamiento, paginación y asociaciones anidadas.

- `POST /inquiry/index`: Recupera un documento único basado en filtros.
- `POST /inquiry/retrieve`: Recupera múltiples documentos con opciones avanzadas.

#### Management
Gestiona esquemas y colecciones, y recupera datos con asociaciones.

- `GET /management/collections`: Lista las colecciones disponibles.
- `POST /management/fetch`: Recupera documentos con expansiones de asociaciones.

#### Mutation
Realiza mutaciones de datos (inserción, actualización, eliminación) con soporte para relaciones complejas (uno-a-uno, uno-a-muchos, muchos-a-muchos).

**Opciones admitidas:**
- `uniques`: Array de campos que deben ser únicos.
- `bridge`: Mapeo para relaciones muchos-a-muchos.
- `audit`: Booleano para agregar campos de auditoría (createdAt, updatedAt).

**Relaciones:**
- **Uno-a-uno**: Objetos anidados se upsertan primero.
- **Uno-a-muchos**: Arrays de objetos se sincronizan (insertar/actualizar/eliminar).
- **Muchos-a-muchos**: Usa tablas pivote para asociaciones.

- `POST /mutation/upsert`: Inserta o actualiza documentos con relaciones.
  - **Parámetros**: `source` (colección), `input` (datos), `options` (opcional).
  - **Ejemplo de solicitud**:
    ```json
    {
      "source": "posts",
      "input": {
        "title": "My First Post",
        "comments": [
          { "text": "Great post!" },
          { "text": "I agree." }
        ]
      },
      "options": {
        "uniques": ["title"]
      }
    }
    ```
  - **Respuesta**: `{ "success": true, "message": "Upsert operation completed successfully." }`

- `POST /mutation/purge`: Elimina documentos y maneja eliminaciones en cascada.
  - **Parámetros**: `source`, `input` (array de documentos con `id`).
  - **Ejemplo de solicitud**:
    ```json
    {
      "source": "posts",
      "input": [
        { "id": "UUID" }
      ]
    }
    ```
  - **Respuesta**: `{ "success": true, "message": "Purge operation completed successfully." }`

#### User
Operaciones CRUD para usuarios, roles y permisos.

- `POST /user`: Crea un nuevo usuario.
- `PATCH /user/:id`: Actualiza un usuario.
- `GET /user/:id`: Obtiene un usuario por ID.
- `GET /user`: Obtiene todos los usuarios.
- `POST /user/roles`: Crea un nuevo rol.
- `POST /user/roles/permissions`: Crea un nuevo permiso.

### Configuración
- Base de datos: MongoDB en `mongodb://localhost:27017/default`.
- Variables de entorno: `JWT_SECRET`, `BCRYPT_ROUNDS`.

## App
La aplicación frontend está construida con Vite y proporciona la interfaz de usuario para interactuar con la API.
