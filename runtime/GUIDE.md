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
  
  const App = () => (<div className="p-10 text-4xl font-black">Ready</div>);

  ReactDOM.createRoot(document.getElementById('root')).render(
    <Main><App /></Main>
  );
</script>
```

---

## 📊 2. Datos (`window.Database`)
Maneja operaciones asíncronas vía **TanStack Query**.
*Subyacente: **Axios (baseURL fijo: http://localhost:8000)***.

- **Consultas**: `useInquiry(source, type, output, options)`
- **Mutaciones**: `useMutation(source, type, options)`

---

## 🔐 3. Identidad (`window.Authentication`)
Estado global de sesión vía **Zustand**.

- **Hook**: `useAuth() -> { isLogged, signin, signup, signout, loggedUser }`
- **Registro**: `signup({ email, password, name })`
- **Acceso**: `signin(email, password)`
- **Salida**: `signout()`

---

## 🗺️ 4. Navegación & SEO (`window.Router`)
Gestión de rutas con **Animaciones Automáticas** y **Metadatos**.
*Subyacente: **React Router 7**, **Framer Motion**, **React Helmet Async***.

- **Configuración de Rutas Plana**:
  ```javascript
  const routes = window.Router.useRoutes([
    { 
      path: "/", 
      element: <Home />, 
      title: "Inicio",           // Título automático en el navegador
      description: "Dashboard" 
    },
    { path: "/login", element: <Login />, title: "Acceso" }
  ]);
  ```

---

## 🛠️ 5. UI Estructural e Interactiva
- **Tabs**: `window.Tabs` (Tabs, TabList, Tab, TabPanel).
- **Tooltip**: `window.Tooltip` (data-tooltip-id).
- **Accordion**: `window.Accordion`.
- **Motion**: `window.Motion`.

---

## ⚡ 6. Iconos y Estilos
- **window.Icons**: Acceso completo a **FontAwesome 6**.
- **window.Utils**: `cn(...classes)` (clsx + tailwind-merge).

---

## 📋 7. Formularios (`window.Form`)
Generación dinámica basada en **JSON Forms**.
