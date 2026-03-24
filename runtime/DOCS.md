# 🚀 Pipelines Runtime Documentation

Esta es la guía de referencia técnica para el uso del bundle `runtime.js` de Pipelines.

---

## 🏗️ 1. Estructura Base y Configuración
Configuración mínima obligatoria para el funcionamiento de la **Base de Datos**, **Autenticación** y **Router**.

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <!-- Tecnologías de Soporte -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.29.1/babel.min.js"></script>
    
    <!-- Runtime de Pipelines -->
    <script src="./dist/runtime.js"></script>
</head>
<body class="bg-black text-white">
    <div id="root"></div>

    <script type="text/babel">
        // ⚠️ CONFIGURACIÓN OBLIGATORIA
        window.PIPELINES = {
            TOKEN: "TU_TOKEN_X_PROJECT_ID" // JWT que identifica al proyecto
        };

        const { Main } = window;
        const { useAuthentication } = Network;
        const { useRouter, useRoutes } = View.Router;

        const App = () => (
            <div className="p-20 text-center">
                <h1 className="text-4xl font-black">¡Hola Pipelines!</h1>
            </div>
        );

        ReactDOM.createRoot(document.getElementById('root')).render(<Main><App /></Main>);
    </script>
</body>
</html>
```

---

## 🛰️ 2. Red & Datos (`Network`)
Gestión de fuentes de datos (HTTP/WS) y autenticación. Todas las mutaciones propagan cambios en tiempo real automáticamente.

### 📊 Datos
*Subyacente: **TanStack Query / Socket.io***.

```javascript
const { useInquiry, useMutation, useSubscription, usePublish } = window.Network;

// CONSULTAS (HTTP + Auto-recarga via Socket 'refresh:source')
const [items, loading, pagination] = useInquiry({
    source: "inventory", 
    type: "retrieve", 
    output: { id: 1, stock: 1, name: 1 }, 
    options: { filter: { status: 'active' }, limit: 10 }
});

// MODIFICACIONES (HTTP + Invalidation Global)
const [save, saving] = useMutation({
    source: "inventory", 
    type: "upsert", 
    refresh: ["inventory"]
});
save({ id: "123", stock: 100 }, (res) => res.success && alert("Guardado"));

// SUSCRIPCIÓN (Real-time Stream continuo)
const chatMessages = useSubscription({ source: "chat", filter: { id: "general" } });

// PUBLICACIÓN (Emisión de eventos/mensajes)
const publish = usePublish({ source: "chat", options: { id: "general" } });
publish({ text: "¡Hola sala!", from: "Usuario1" });
```

### 🔐 Autenticación (`Network`)
*Subyacente: **Zustand / JWT***. Estado global de sesión.

```javascript
const { useAuthentication } = window.Network;
const { isLogged, signin, signup, signout, loggedUser } = useAuthentication();

await signin("user@example.com", "mi_password");
signout();
```

---

## 🖼️ 3. Visualización & Navegación (`View`)
Control del estado visual de la página, rutas y jerarquía de navegación.

### 🗺️ Rutas & SEO (`View.Router`)
*Subyacente: **React Router 7 / Framer Motion / Helmet***.

```javascript
const { useRouter, useRoutes } = View.Router;

const App = () => {
    const routesConfig = [
        { path: "/", element: <Home />, title: "Inicio" },
        { path: "/app", element: <Dashboard />, title: "Mi Panel" }
    ];
    return useRoutes(routesConfig);
};

const { navigate, setQuery } = useRouter();
setQuery({ status: "active" }); // ?status=active
navigate('/app');
```

---

## 🎨 4. Interfaz & Componentes (`Interface`)
Herramientas visuales integradas para la construcción rápida de UIs.

### 📋 Formularios Dinámicos (`Interface.Form`)
```javascript
const { useForm } = Interface.Form;
const [submit, MyForm, values, isValid] = useForm(schema);

<MyForm initial={{ name: "Pipeline" }} />
```

### 🧭 Navegación Local (`Interface.Breadcrumbs`)
Generación automática de caminos de navegación.

```javascript
const { Breadcrumbs } = Interface;

// Automático basado en la URL actual y títulos definidos en useRoutes
<Breadcrumbs />

// Con configuración personalizada
<Breadcrumbs separator=" / " className="mb-8" />
```

### 🎨 Temas & Estilos (`Interface.Theme`)
```javascript
const { theme, toggleTheme } = Interface.Theme.useTheme();
```

### 🧱 Componentes Extra
- **Barra Lateral**: `window.Interface.Sidebar`
- **Iconos**: `window.Interface.Icons` (FontAwesome 6)
- **Notificaciones**: `window.Interface.Notification` (Toasts)
- **Modales/Dialogos**: `window.Interface.Dialog`
- **Tablas**: `window.Interface.Table`
- **Pestañas**: `window.Interface.Tabs`
- **Animaciones**: `window.Interface.Motion` (Framer Motion)
- **Utilidades**: `window.Utils.cn` (Concatenación de clases Tailwind)

---

## 🧱 5. UI Estructural & Componentes Profesionales
- **Pestañas (`window.Tabs`)**: Basado en `react-tabs`. Contiene: `Tabs, TabList, Tab, TabPanel`.
- **Tooltip (`window.Tooltip`)**: Basado en `react-tooltip`.
- **Acordeón (`window.Accordion`)**: Basado en `react-accessible-accordion`.
- **Animaciones (`window.Motion`)**: Acceso directo a `framer-motion` (ej: `motion.div`).

---

## 🎨 6. Temas & Estilos Contextuales
*Subyacente: **Tailwind CSS / clsx / tailwind-merge***.

```javascript
const { theme, toggleTheme } = window.Theme.useTheme();
const { cn } = window.Utils; // Utilidad para concatenar clases condicionales de Tailwind

<div className={cn("p-4 transition-all", theme === 'dark' ? "bg-black" : "bg-white")} />
```

---

## 📋 7. Formularios dinámicos (`Form`)
*Subyacente: **JSON Forms / Ajv***. Generador de formularios reactivo.

```javascript
const { useForm } = window.Form;
const [submit, MyForm, values, isValid] = useForm(schema);

<MyForm initial={{ name: "Pipeline" }} />
```

---

## 🧭 8. Sidebar & Navegación Lateral
*Subyacente: **Zustand / LocalStorage***.

```javascript
const { isExpanded, toggleSidebar } = window.Sidebar.useSidebar();
```
