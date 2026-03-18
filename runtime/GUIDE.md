# 🤖 Pipelines Runtime: LLM Context & Prompt Guide

> [!IMPORTANT]
> **REGLA DE ORO**: El uso de los módulos y firmas definidos en esta guía es **OBLIGATORIO** siempre que se genere funcionalidad de su tipo (Base de datos, Auth, Form, etc). No inventar soluciones personalizadas ni usar librerías externas si existe un componente nativo en `window`.

---

## 🏗️ 1. Entorno y Configuración Base
- **Tecnologías**: React, Tailwind CSS, Babel Standalone.
- **Contenedor**: `<div id="root"></div>`.
- **Inyección Global**: `window.PIPELINES`.

```html
<!-- Boilerplate HTML -->
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.29.1/babel.min.js"></script>
<script src="./dist/runtime.js"></script>

<script type="text/babel">
  window.PIPELINES = { TOKEN: "tu_token_aqui" };
  const { Main } = window;
  
  const App = () => (<div className="p-10 text-4xl font-black">Ready</div>);

  ReactDOM.createRoot(document.getElementById('root')).render(
    <Main><App /></Main>
  );
</script>
```

---

## 📊 2. Datos (`window.Database`)
Maneja operaciones asíncronas vía **React Query**.

- **Consultas**: `useInquiry(source, type, output, options)`
  - `type`: "retrieve" (lista) | "index" (uno)
  - Returns: `[data, isLoading, pagination]`
- **Mutaciones**: `useMutation(source, type, options)`
  - `type`: "upsert" (guardar) | "purge" (eliminar)
  - Returns: `[mutate, isPending]`
  - `mutate(payload, callback?)`: Firma del callback `(res) => void` (res: `{success, message}`).

---

## 🔐 3. Identidad (`window.Authentication`)
Estado global de sesión vía **Zustand**.

- **Hook**: `useAuth()`
- **Atributos**: `isLogged`, `loggedUser` (objeto usuario).
- **Métodos (async)**: `signin(email, pass)`, `signup(email, pass, name)`, `signout()`.

---

## 🗺️ 4. Navegación (`window.Router`)
Gestión de rutas vía **React Router 7**.

- **Ganchos**:
  - `useRouter()`: `{ navigate, setQuery, pathname, params, searchParams }`
  - `useRoutes()`: Para definir las rutas declarativamente.
  
- **Firma setQuery**: `setQuery(params, { merge: true })`
  - `params`: Objeto con valores (pasar `null` para eliminar).
  - `merge`: Si es `true` (default), combina. Si es `false`, reemplaza todo.

- **Ejemplo**:
  ```javascript
  const { setQuery, navigate } = window.Router.useRouter();
  setQuery({ page: 2 }); // ?page=2 preservando otros
  navigate(-1); // Volver atrás
  ```

---

## 🛠️ 5. UI Estructural
- **window.Sidebar**: `useSidebar() -> { isExpanded, toggleSidebar, isMobileOpen, toggleMobileSidebar }` (React Context).
- **window.Theme**: `useTheme() -> { theme, toggleTheme }` (temas: 'light' | 'dark').
- **window.Notification**: `useToast() -> { show }` (Sonner; tipos: 'success' | 'error' | 'info').

---

## ⚡ 6. Iconos y Estilos
- **window.Icons**: Acceso directo a **FontAwesome 6**.
- **Uso**: `const { FaHome, FaBolt } = window.Icons;`.

---

## 📋 7. Formularios (`window.Form`)
Generación dinámica basada en **JSON Forms**.

- **Hook**: `useForm(schema)`
- **Schema**: Soporta tipos `vertical` y `horizontal` con `items: []`.
- **Returns**: `[submit, FormComponent, values, isValid]`
- **Componente**: Soporta prop `initial={obj}` de pre-cargar datos.

---

## 📁 8. Otros Componentes
- **window.Table**: `{ DataGrid, useTable }`.
- **window.Dropdown**: `useDropdown() -> [toggle, open, close, isOpen, Menu]`.
- **window.Dialog**: `useDialog() -> [open, close, Modal]`.
