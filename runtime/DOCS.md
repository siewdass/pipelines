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

## 📊 2. Base de Datos (`Database`)
*Subyacente: **TanStack Query / Axios***. Gestión de fuentes de datos.

```javascript
const { useInquiry, useMutation } = window.Database;

// CONSULTAS (Lista con paginación)
const [items, loading, pagination] = useInquiry("inventory", "retrieve", { status: 'active' }, { limit: 10 });

// MODIFICACIONES (Guardar)
const [save, saving] = useMutation("inventory", "upsert");
save({ id: "123", stock: 100 }, (res) => res.success && alert("Guardado"));
```

---

## 🔐 3. Autenticación (`Authentication`)
*Subyacente: **Zustand / JWT***. Estado global de sesión.

```javascript
const { useAuth } = window.Authentication;
const { isLogged, signin, signup, signout, loggedUser } = useAuth();

// Inicio de Sesión
await signin("user@example.com", "mi_password");

// Registro
await signup({ email: "user@example.com", password: "...", name: "Juan" });

// Cierre de Sesión
signout();
```

---

## 🗺️ 4. Navegación & SEO (`Router`)
*Subyacente: **React Router 7 / Framer Motion / Helmet***.

```javascript
const { useRouter, useRoutes } = window.Router;

// Definición de Rutas con Títulos y Descripciones automáticas
const App = () => {
    const routesConfig = [
        { 
            path: "/", 
            element: <Home />, 
            title: "Inicio"     // Título automático en el navegador
        },
        { 
            path: "/app", 
            element: <Dashboard />, 
            title: "Mi Panel", 
            description: "Resumen estadístico" 
        }
    ];
    return useRoutes(routesConfig);
};

// Navegación Programática y Query Params
const { navigate, setQuery } = useRouter();
setQuery({ status: "active" }); // Actualiza parámetros en la URL (?status=active)
navigate('/app');              // Navega a una ruta (con transición suave)
```

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
