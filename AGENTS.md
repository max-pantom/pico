# AGENTS.md

This file is guidance for coding agents working in this repository.
It is based on the current codebase state.

## Project Snapshot

- Stack: React 19 + TypeScript + Vite 7.
- Styling: Tailwind CSS v4 utility classes in JSX.
- State: Zustand (`src/store/engineStore.ts`).
- LLM integration: Ollama browser client (`src/lib/llm.ts`).
- App shape: pipeline-driven UI generation and renderer.

## Rule Files Check

- Checked `.cursor/rules/`: not present.
- Checked `.cursorrules`: not present.
- Checked `.github/copilot-instructions.md`: not present.
- No Cursor/Copilot rule files are currently active in-repo.

## Install

- Install dependencies: `npm install`

## Run / Build / Lint / Preview

- Dev server: `npm run dev`
- Production build: `npm run build`
- Lint all files: `npm run lint`
- Preview built output: `npm run preview`

## Test Commands (Current State)

- There is currently no configured test runner in `package.json`.
- There is no `test` script and no project tests under `src/`.
- Running `npm test` will fail unless a test script is added.

## Single-Test Execution

Because tests are not yet configured, there is no native single-test command today.

If Vitest is added later, use:

- Single file: `npx vitest run src/path/to/file.test.ts`
- Single test name: `npx vitest run src/path/to/file.test.ts -t "test name"`
- Watch one file: `npx vitest src/path/to/file.test.ts`

If Jest is added instead, use:

- Single file: `npx jest src/path/to/file.test.ts`
- Single test name: `npx jest src/path/to/file.test.ts -t "test name"`

## Type Checking

- Type checking is enforced during build via `tsc -b`.
- App config: `tsconfig.app.json`.
- Node/Vite config: `tsconfig.node.json`.
- Strict mode is enabled (`"strict": true`).
- `noUnusedLocals` and `noUnusedParameters` are enabled.

## Linting Rules in Effect

- ESLint flat config is used (`eslint.config.js`).
- Active configs:
  - `@eslint/js` recommended
  - `typescript-eslint` recommended
  - `eslint-plugin-react-hooks` recommended
  - `eslint-plugin-react-refresh` vite config
- `dist/` is ignored by ESLint.

## Code Style Guidelines

Follow existing patterns in nearby files first.

### Imports

- Put imports at top of file.
- Group by purpose:
  1) external packages
  2) internal modules
  3) type imports (or use inline `import type` where already used)
- Prefer `import type` for types.
- Use relative imports inside `src/` (no path aliases are configured).
- Match local file convention for extension usage:
  - Most internal imports omit extensions.
  - `src/main.tsx` currently imports `./app/App.tsx`; preserve surrounding style when editing.

### Formatting

- Use semicolon-free style (current codebase standard).
- Use single quotes for strings.
- Keep trailing commas where supported (objects, arrays, params).
- Prefer readable multiline formatting for long JSX attributes.
- Keep functions small and focused.
- Do not introduce a new formatter config unless requested.

### Types

- Avoid `any`; prefer explicit interfaces/types.
- Reuse domain types from `src/types/pipeline.ts`.
- Use union types for constrained values.
- Type async function returns explicitly when non-trivial.
- Narrow `unknown` errors before use (`e instanceof Error ? e.message : ...`).

### Naming Conventions

- React components: PascalCase (`PromptInput`, `LayoutRenderer`).
- Component filenames: PascalCase (`Header.tsx`, `DataTable.tsx`).
- Functions/variables: camelCase (`runPipeline`, `qualityResult`).
- Constants: UPPER_SNAKE_CASE for true constants (`MAX_RETRIES`, `SYSTEM_PROMPT`).
- Store hooks: `useXxxStore` pattern.
- Type/interface names: PascalCase.
- String literal unions: kebab-case values where domain-specific.

### React / UI Patterns

- Use function components.
- Keep state local unless shared app-wide; shared state goes in Zustand store.
- Derive simple booleans close to usage (`isRunning`).
- Keep conditional rendering explicit and readable.
- Prefer composition through renderer/registry patterns already present.

### Error Handling

- Fail fast on invalid external/LLM responses.
- Wrap JSON parsing in `try/catch` and throw clear errors with context.
- Convert unknown thrown values into safe messages.
- In UI flow, surface errors via store (`setError`) and render user-visible feedback.
- Do not swallow errors silently.

### Pipeline-Specific Guidance

- Preserve stage transition semantics (`parsing`, `reasoning`, `building`, `rendering`, etc.).
- Keep quality gate retry logic deterministic and bounded.
- Keep prompts as plain template strings and return JSON-only expectations.
- When changing schema, update both:
  - Type definitions in `src/types/pipeline.ts`
  - Prompt schema text in parser/reasoner files

### Environment and Secrets

- Required env vars in use:
  - `VITE_OLLAMA_API_KEY`
  - `VITE_OLLAMA_MODEL` (optional override)
- Never hardcode secrets.
- Do not commit `.env` contents.

## File/Folder Conventions

- `src/app/`: top-level app shell and interaction entry.
- `src/pipeline/`: intent/design/token/layout/quality pipeline layers.
- `src/renderer/`: layout renderer and component registry.
- `src/renderer/components/`: primitive renderable UI blocks.
- `src/store/`: Zustand state containers.
- `src/types/`: shared domain types.
- `src/lib/`: integrations (LLM client).

## Agent Workflow Checklist

- Read nearby files before editing; match local style.
- Run `npm run lint` after meaningful changes.
- Run `npm run build` when changing types, pipeline logic, or app wiring.
- If tests are added later, run relevant single tests first, then full suite.
- Keep diffs focused; avoid opportunistic refactors unless requested.

## Known Gaps (As of now)

- No automated test suite is configured yet.
- No formatter config (Prettier/EditorConfig) is present.
- No repository-specific Cursor/Copilot instruction files are present.
