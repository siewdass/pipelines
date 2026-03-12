# Pipelines Core Reference

A simple reference of the key systems, hooks, and libraries used in this project.

## 🔑 Authentication System
- **Library**: `zustand`
- **What it does**: Centralizes user session logic, login/registration API calls, and persistent authentication state using the `useAuthStore` hook. It also provides the `isAuthenticated` flag used for route protection in `App.tsx`.

## 📦 Form Engine
- **Library**: `@jsonforms`
- **What it does**: Powered by the `useForm` hook, it dynamically renders complex UI forms from simple schemas. Features stable focus management and support for cross-field custom validation logic.

## 🔔 Notifications
- **Library**: `sonner`
- **What it does**: Managed via the `useToast` hook, it handles all user feedback (success, error, or info) with rich-color floating alerts.

## 🧩 Context & UI State
- **Library**: React Context API
- **What it does**: Manages global UI-specific states like the sidebar visibility (`SidebarContext`). Ideal for overhead state that doesn't require the complexity of a state management library.
