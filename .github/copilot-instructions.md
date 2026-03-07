# Copilot Instructions (index)

IMPORTANT: Before making any changes to the repository, the agent MUST read and summarize all files in `.github/instructions/` (or the consolidated `INSTRUCTIONS.md` if present) and ask the user for explicit confirmation. Do not apply edits until the user confirms.

This file centralizes and explains the instruction files stored under `.github/instructions/`.

Files referenced:

- `AGENT.instructions.md` — General agent rules (language, question-only behavior, confirmation before changes).
- `NODE.instructions.md` — Node-specific rules: use pnpm; do not edit package.json directly; use `pnpm add`/`pnpm remove`.
- `REACT.instructions.md` — React-specific conventions: React Hook Form + Zod, Zustand for global state, etc.
- `TYPESCRIPT.instructions.md` — TypeScript code rules: English identifiers, strict typing, tabs for indentation, no `any`, Zod validation, etc.

Usage:
- Copilot (or any agent) should read this index first and then consult the referenced files when more detail is required.
- This file is informational and not authoritative; agents should still follow the applyTo scopes in each instruction file.

Contact:
- If you want to change global behavior (e.g., auto-load instructions at session start), edit `AGENT.instructions.md`.
