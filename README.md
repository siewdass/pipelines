# Pipelines Core Reference

A simple reference of the key systems, hooks, and libraries used in this project.

## 🔑 Authentication System
- **Library**: `zustand`
- **What it does**: Centralizes user session logic, login/registration API calls, and persistent authentication state using the `useAuthStore` hook. It also provides the `isAuthenticated` flag used for route protection in `App.tsx`.

## 📦 Form Engine
- **Library**: `@jsonforms` / Custom Bridge
- **What it does**: Powered by the `useForm` hook, it dynamically renders complex UI forms from simple schemas. Features stable focus management and support for cross-field custom validation logic.

## 🪝 Custom Hooks

### Data Fetching & Mutations (`useFetch.ts`)
- **`useQuery<T>(key, url, params?)`**: 
  - The standard for **GET** requests.
  - Automatically handles caching (via React Query), loading states, and error toasts.
  - If `params` are provided, they are sent as URL query parameters.
  - **Returns**: `[data, isLoading]`
- **`useMutate<T>(method, url, keys?)`**:
  - Used for **POST, PUT, PATCH, DELETE** operations.
  - **Returns**: `[execute, isPending, data]`
  - Automatically invalidates queries matching the `keys` string or array to keep the UI in sync.
  - Shows success messages if the backend returns a `message` field.

### Form Management (`useForm.tsx`)
- **`useForm<T>(schema)`**:
  - Binds a JSON schema to a stable, robust form component.
  - **Returns**: `[onSubmit, FormComponent]`
  - `onSubmit` validates the form and triggers a callback with typed data.

### Utilities & UI
- **`useToast()`**: A clean interface for `sonner` notifications (`success`, `error`, `info`, `warning`).
- **`useModal(initialState?)`**: Boilerplate-free state management for modals (`isOpen`, `openModal`, `closeModal`, `toggleModal`).
- **`useGoBack()`**: Navigation helper that returns to the previous page or falls back to `/` if there is no history.

## 🧩 Context & UI State
- **Library**: React Context API
- **What it does**: Manages global UI-specific states like the sidebar visibility (`SidebarContext`). Ideal for state that affects layout or shared UI components.

## 🔔 Notifications
- **Library**: `sonner`
- **What it does**: Global toast system rendered in the main layout. Intercepts API errors and mutation success messages automatically.
