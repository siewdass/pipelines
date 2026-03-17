---
name: pnpm-only
description: Ensures that pnpm is always used as the package manager instead of npm for this project.
---

# PNPM Only Enforcement

This skill ensures that all package management operations in the `pipelines` project (both in `api` and `app` directories) are performed exclusively using `pnpm`.

## Principles

1.  **NEVER** use `npm` or `yarn` commands.
2.  **ALWAYS** use `pnpm` for installing, removing, or updating dependencies.
3.  **VALIDATE** the existence of `pnpm-lock.yaml` if in doubt.

## Common Command Mappings

| Action | NPM Command | PNPM Command |
| :--- | :--- | :--- |
| Install dependencies | `npm install` | `pnpm install` |
| Add a package | `npm install <pkg>` | `pnpm add <pkg>` |
| Add dev dependency | `npm install -D <pkg>` | `pnpm add -D <pkg>` |
| Remove a package | `npm uninstall <pkg>` | `pnpm remove <pkg>` |
| Run a script | `npm run <script>` | `pnpm <script>` or `pnpm run <script>` |
| Execute a binary | `npx <cmd>` | `pnpm dlx <cmd>` |

## Enforcement

Whenever any tool (like `run_command`) is used to interact with dependencies or project scripts, the `pnpm` version must be preferred. If a user request implies the use of `npm`, the assistant should proactively switch to `pnpm`.
