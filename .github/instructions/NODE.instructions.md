---
applyTo: '**/*.{js,jsx,ts,tsx,json}'
---

# Node Instructions

- Always use PNPM as the package manager.
- Search for any `*eslint*` configuration (files or package.json sections) and follow the rules it defines when writing or modifying code.
- Do not edit `package.json` directly. Use `pnpm add <pkg>` or `pnpm remove <pkg>` so the lockfile and workspace are updated correctly.
- Do not use any build command to validate errors; instead, use `npx tsc --noEmit`.
