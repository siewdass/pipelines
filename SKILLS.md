# Project Rules

## 🌍 Language & Communication
- **Response Language**: Always respond to the user in **Spanish**.
- **Question Handling**: If a message ends with a question mark ("?"), treat it strictly as a question. Provide explanations but **DO NOT** perform file modifications.
- **Confirmation Protocol**: Before any code change, briefly explain the "how" and "why". Explicitly ask: "Are you sure this is what you want to do?" and wait for user confirmation. **Avoid suggesting topics unrelated to the original request.**
- **Code & Comments**: All variables, functions, classes, and documentation/JSDoc MUST be in **English**.
- **Context Integrity**: If information is missing for precise execution, stop and request the specific details needed before proposing a solution.

## 🛠️ Node & Package Management
- **Package Manager**: Always use `pnpm`. Do not use `npm` or `yarn`.
- **Manual Edits**: Never edit `package.json` manually. Use `pnpm add <pkg>` or `pnpm remove <pkg>`.
- **Validation**: Use `npx tsc --noEmit` to validate type errors instead of build commands.
- **Linting**: Respect ESLint configurations and rules during code generation.

## 🚀 TypeScript & Code Quality
- **Indentation**: Always use **TABS (\t)** for TS/TSX files. No spaces allowed.
- **Typing**: Strict typing is mandatory. **Use of `any` is strictly prohibited**.
- **Naming Conventions**: Use descriptive English names. **Avoid abbreviations** unless they are industry standards.
- **Exports**: Avoid `export default` unless it's a primary entry point (e.g., route files). Favor named exports.
- **Asynchrony**: Always use `async/await` over `.then()` promise chains. Code must be linear and highly readable.
- **Immutability**: Avoid direct mutations; favor immutable patterns.
- **Structure**: Maintain modularity, separated by domain and functionality. Respect existing folder hierarchy.
- **Density**: Never declare a variable if it is only used once. Inline the expression directly into the return, component, or function.
- **Principle of Least Mutation**: Strictly confine logic or structural changes to the exact requested scope. Do not alter adjacent code, imports, or styles unless explicitly required.

## ⚛️ React Guidelines
- **Forms**: Always use **React Hook Form** with **Zod** for data validation.
- **Global State**: Use **Zustand** for state management.
- **Data Fetching**: Use **TanStack Query (React Query)** for fetching and cache management.
- **Optimization**: Validate real need for `useMemo` and `useCallback` to avoid over-engineering.
- **Components**: Use modern functional components with TypeScript.

## 📂 Data & Backend
- **Validation**: Use **Zod** schemas for data validation in both frontend and backend.
- **API**: Centralize endpoints in `constants/` files.
- **Continuous Documentation**: Document public functions and exported modules in detail (English). **STRICT RULE**: Document changes/additions in the same step they are implemented. Documentation must evolve in real-time.
