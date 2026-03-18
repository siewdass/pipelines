# 🚀 Pipelines Runtime Documentation

Esta es la guía de referencia para usar el bundle `runtime.js` de Pipelines. Todo el sistema está expuesto en el objeto global `window` para facilitar su uso en páginas estáticas con Babel y Tailwind CDN.

---

## 🏗️ 1. Estructura Base
Esta es la estructura mínima para construir una página reactiva con el bundle de Pipelines. Incluye **Tailwind CSS** para estilos y **Babel** para interpretar JSX en el navegador.

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Estilos y Runtime -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="./dist/runtime.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.29.1/babel.min.js"></script>
</head>
<body class="bg-slate-50">
    <div id="root"></div>

    <script type="text/babel">
        const { Main } = window;
        
        const App = () => (
            <div className="p-20 text-center">
                <h1 className="text-4xl font-black">¡Hola Pipelines!</h1>
            </div>
        );

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<Main><App /></Main>);
    </script>
</body>
</html>
```

---

## 📊 2. Base de Datos (`Database`)
*Subyacente: **React Query***. Gestión de fuentes de datos genéricas (inventarios, tareas, etc).

```javascript
const { useInquiry, useMutation } = window.Database;

/**
 * CONSULTAS (useInquiry)
 * Firma: (source, type, output, options)
 * - source: "nombre_de_la_fuente"
 * - type: "retrieve" (lista) | "index" (uno)
 * - output: { filtros y campos }
 * - options: { limit, page } -> Solo para 'retrieve'
 */

// Ejemplo: Lista de registros con paginación
const [items, loading, pagination] = useInquiry("inventory", "retrieve", { filter: { active: true } }, { limit: 10, page: 1 });

// Ejemplo: Registro único
const [item] = useInquiry("inventory", "index", { id: "ABC-123" });

/**
 * MODIFICACIONES (useMutation)
 * Firma: (source, type, options) -> [mutate, isPending]
 */

const [save, saving] = useMutation("inventory", "upsert");

<button
    onClick={() => save({ id: "ABC-123", stock: 50 }, (res) => res.success && console.log("¡Guardado!"))}
    disabled={saving}
>
    {saving ? "Guardando..." : "Guardar"}
</button>
```

---

## 🔐 3. Autenticación (`Authentication`)
*Subyacente: **Zustand / JWT***. Gestión de sesión y usuarios.

```javascript
const { useAuth } = window.Authentication;
const { isLogged, signin, signup, signout, loggedUser } = useAuth();

await signin("user@example.com", "123456");
await signup("user@example.com", "123456", "John Doe");
signout();
```

---

## 🗺️ 4. Navegación (`Router`)
*Subyacente: **React Router 7***. Hook para control de rutas y definición del sistema.

```javascript
const { useRouter, useRoutes } = window.Router;

// 1. Definir rutas del sistema
const App = () => {
    const routes = useRoutes([
        { path: "/", element: <Landing /> },
        { path: "/users", element: <UserList /> }
    ]);
    return routes;
};

// 2. Controlar la navegación
const { navigate, setQuery } = useRouter();

// Navegar a una ruta
navigate('/dashboard');

// Volver atrás
navigate(-1);

// Actualizar parámetros (ej: ?filter=active)
setQuery({ filter: 'active' }); 

// Reemplazar parámetros (ej: borrar todo y poner solo page=1)
setQuery({ page: 1 }, { merge: false });

// Eliminar un parámetro
setQuery({ filter: null });
```

---

## 🎨 5. Temas (`Theme`)
*Subyacente: **Custom Context***. Control de modo oscuro.

```javascript
const { useTheme } = window.Theme;
const { theme, toggleTheme } = useTheme();

toggleTheme();
```

---

## 🔔 6. Notificaciones (`Notification`)
*Subyacente: **Sonner***. Alertas visuales.

```javascript
const { useToast } = window.Notification;
const { show } = useToast();

show("Guardado con éxito", "success");
```

---

## 🧱 7. Componentes UI (`Table`, `Dropdown`, `Dialog`)
*Subyacente: **TanStack Table (en Table) / Headless UI***.

### DataGrid (Tabla)
```javascript
const { DataGrid, useTable } = window.Table;
const table = useTable({ data, columns });

<DataGrid table={table} />
```

### Dropdown (Menú)
```javascript
const { useDropdown } = window.Dropdown;
const [toggle, open, close, isOpen, Menu] = useDropdown();

<button onClick={toggle}>Opciones</button>
<Menu>...</Menu>
```

---

## ⚡ 8. Iconos (`Icons`)
*Subyacente: **FontAwesome 6***. Acceso directo a todas las glifos de FA.

```javascript
const { FaHome, FaShieldHalved } = window.Icons;

<FaHome />
<FaShieldHalved />
```

---

## 🛠️ 9. Formularios (`Form`)
*Subyacente: **JSON Forms***. Generador dinámico de formularios.

```javascript
const { useForm } = window.Form;

// Ejemplo con Layout Horizontal y Vertical combinado
const [submit, MyForm, values, isValid] = useForm({
    type: "vertical",
    items: [
        { 
            type: "horizontal", 
            items: [
                { name: "nombre", type: "string", label: "Nombre", required: true },
                { name: "edad", type: "number", label: "Edad" }
            ]
        },
        { name: "biografia", type: "string", label: "Bio", min: 10 }
    ]
});

// Soporta precarga de datos mediante el prop 'initial'
<MyForm initial={{ nombre: "Juan Pérez", edad: 30 }} />

const handleSave = () => submit(data => console.log(data));
<button onClick={handleSave} disabled={!isValid}>Guardar</button>
```

---

## 🗺️ 10. Navegación Lateral (`Sidebar`)
*Subyacente: **Custom Context / LocalStorage***.

```javascript
const { useSidebar } = window.Sidebar;
const { isExpanded, toggleSidebar } = useSidebar();

<button onClick={toggleSidebar}>Toggle</button>
```
