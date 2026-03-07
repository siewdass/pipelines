---
applyTo: '**/*.{ts,tsx}'
---

# Typescript Instructions

Provide TypeScript context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

- Always name variables, functions, and classes in English.
- Use descriptive and meaningful names; avoid abbreviations unless they are standard.
- Write all comments and documentation in English.
- Use strict typing with TypeScript; avoid using `any`.
- Keep code modular: separate logic by domain and feature.
- Follow existing folder and file structure conventions.
- Validate data using Zod schemas (backend and frontend).
- Use React Query for frontend data fetching and cache management.
- Keep API endpoints centralized in `constants/` files.
- Prefer async/await for asynchronous code.
- Avoid direct mutations; use immutable patterns.
- Document public functions and exported modules.
- Before implementing, always explain the approach and ask for user confirmation.
- Always use tabs (\t) for indentation in all TypeScript files. Do not use spaces for indentation.
- Do not use `export default` unless the file is a main entry point, such as a route file.
