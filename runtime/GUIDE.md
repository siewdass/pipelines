# 🤖 Pipelines Runtime: LLM Context & Prompt Guide

> [!IMPORTANT]
> **REGLA DE ORO**: El uso de los módulos y firmas definidos en esta guía es **OBLIGATORIO** siempre que se genere funcionalidad de su tipo (Base de datos, Auth, Form, etc). No inventar soluciones personalizadas ni usar librerías externas si existe un componente nativo en `window`.

---

## 🏗️ 1. Entorno y Configuración Base (Obligatorio)
- **Tecnologías**: React, Tailwind CSS, Babel Standalone.
- **Inyección Global**: `window.PIPELINES`. **Sin este objeto cargado al inicio, las peticiones fallarán.**

```html
<!-- Boilerplate HTML -->
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.29.1/babel.min.js"></script>
<script src="./dist/runtime.js"></script>

<script type="text/babel">
  // Configuración de Identidad (Obligatorio)
  window.PIPELINES = { 
    TOKEN: "TU_TOKEN_X_PROJECT_ID" // JWT que identifica al proyecto y al usuario
  };

  const { Main } = window;
  const { Breadcrumbs } = window.Interface;
  
  const App = () => (
    <div className="p-10">
      <Breadcrumbs />
      <h1 className="text-4xl font-black mt-4">Ready</h1>
    </div>
  );

  ReactDOM.createRoot(document.getElementById('root')).render(
    <Main><App /></Main>
  );
</script>
```

---

## 📊 2. Red & Datos (`window.Network`)
Maneja operaciones asíncronas HTTP e intercambio de datos continuo vía WebSockets.

### 🔌 Datos
- **Consultas (HTTP)**: `useInquiry({ source, type, output, options })`
- **Mutaciones (HTTP)**: `useMutation({ source, type, options, refresh })`
- **Suscripciones (Socket)**: `useSubscription({ source, filter })`
- **Publicaciones (Socket)**: `usePublish({ source, options })`

### 🔐 Identidad
- **Hook**: `useAuthentication() -> { isLogged, signin, signup, signout, loggedUser }`
- **Acceso Directo**: `signin(email, password)`, `signup({ email, password, name })`, `signout()`

---

## 🗺️ 3. Rutas & Jerarquía (`window.View`)
Gestión de navegación con **Metadatos** y **Animaciones**.

- **Router**: `window.View.Router.useRoutes([...])` con soporte para `{ path, element, title, description }`.
- **Navegación Local**: `window.Interface.Breadcrumbs` (Automático).

---

## 🛠️ 4. Interfaz & Componentes (`window.Interface`)
- **Formularios**: `useForm` (Generación JSON Forms).
- **Control Visual**: `Breadcrumbs`, `Sidebar`, `Theme`.
- **Widgets**: `Tabs`, `Tooltip`, `Accordion`, `Motion`.
- **Feedback**: `Notification` (Toasts).
- **UI Elements**: `Dropdown`, `Table`, `Dialog`.
- **Iconos**: `Icons` (FontAwesome 6).

---

## ⚡ 5. Utilidades y Helpers
- **window.Utils**: `cn(...classes)` y `Date` (date-fns).

---

## 📋 6. Resumen de Namespaces
- **Network**: Todo lo que requiere conexión (Data & Auth).
- **Interface**: Todo lo visual y componentes interactivos.
- **View**: Todo lo relacionado a la ubicación y vista actual (Router).
- **Utils**: Lógica pura y utilidades de estilo.
