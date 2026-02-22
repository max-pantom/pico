# AGENTS.md

Guidance for coding agents working in this repository.
Use this as the default operating guide unless a user prompt overrides it.

## Project Snapshot

- Stack: React 19 + TypeScript + Vite 7 (`type: module`).
- Styling: Tailwind CSS v4 utility classes in JSX.
- State: Zustand stores in `src/store/` (`usePicoStore`, `useEngineStore`).
- LLM integration: Ollama browser SDK via `src/lib/llm.ts`.
- Main architecture: prompt -> pipeline -> layout JSON -> renderer.

## Repository Rule Files

Checked for additional agent instructions:

- `.cursor/rules/00-product-intent.mdc`: present.
- `.cursor/rules/10-agent-workflow.mdc`: present.
- `.cursorrules`: not present.
- `.github/copilot-instructions.md`: not present.

Cursor rules are present under `.cursor/rules/`.

## Setup And Core Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Production build (includes type-check): `npm run build`
- Lint entire repo: `npm run lint`
- Preview production build: `npm run preview`

## Test Commands (Current State)

- No test runner is configured in `package.json` today.
- No `test` script exists.
- No `*.test.*` / `*.spec.*` files currently exist in `src/`.
- `npm test` will fail until a test script is added.

## Single-Test Commands (When Tests Are Added)

If Vitest is adopted:

- Run one file: `npx vitest run src/path/to/file.test.ts`
- Run one test name: `npx vitest run src/path/to/file.test.ts -t "test name"`
- Watch one file: `npx vitest src/path/to/file.test.ts`

If Jest is adopted:

- Run one file: `npx jest src/path/to/file.test.ts`
- Run one test name: `npx jest src/path/to/file.test.ts -t "test name"`

## TypeScript And Linting Baseline

- TypeScript project references are in `tsconfig.json`.
- App TS config: `tsconfig.app.json`.
- Node/Vite TS config: `tsconfig.node.json`.
- Strict mode is enabled.
- `noUnusedLocals` and `noUnusedParameters` are enabled.
- Build command runs `tsc -b` before `vite build`.
- ESLint uses flat config in `eslint.config.js`.
- ESLint extends:
  - `@eslint/js` recommended
  - `typescript-eslint` recommended
  - `eslint-plugin-react-hooks` recommended
  - `eslint-plugin-react-refresh` Vite config
- `dist/` is ignored by ESLint.

## Architecture Map

- `src/app/`: application shell, prompt input flow, exploration/selection UI.
- `src/pipeline/`: intent parsing, design reasoning, layout/state generation, quality gating.
- `src/renderer/`: layout renderer and component registry.
- `src/renderer/components/`: primitive composable UI blocks.
- `src/store/`: Zustand stores for UI/pipeline state.
- `src/types/`: domain types for pipeline contracts.
- `src/lib/`: integrations (LLM client, code export helpers).

## Code Style Guidelines

Follow nearby file style first, then apply these defaults.

### Imports

- Keep imports at top of file.
- Use grouping order:
  1) external packages
  2) internal modules
  3) type-only imports
- Prefer `import type` for types.
- Use relative imports inside `src/` (no path aliases configured).
- Preserve local extension style:
  - Most internal imports omit extensions.
  - `src/main.tsx` imports `./app/App.tsx`; keep existing local convention when editing.

### Formatting

- Use semicolon-free style.
- Prefer single quotes.
- Keep trailing commas where syntax supports them.
- Use multiline formatting for long JSX props and object literals.
- Keep functions focused and reasonably short.
- Do not introduce new formatter tooling/config unless asked.

### Types

- Avoid `any`; prefer explicit interfaces/type aliases.
- Reuse shared types from `src/types/pipeline.ts` when possible.
- Prefer unions for constrained value sets.
- Add explicit return types to exported functions and non-trivial async functions.
- Narrow unknown errors safely (`e instanceof Error ? e.message : String(e)`).

### Naming

- Components and type names: PascalCase.
- Component filenames: PascalCase (`PromptBar.tsx`, `LayoutRenderer.tsx`).
- Variables/functions/hooks: camelCase.
- Store hooks: `useXxxStore`.
- True constants: UPPER_SNAKE_CASE.
- Domain string literal values: kebab-case where meaningful.

### React And State Patterns

- Use function components.
- Keep state local unless shared; move shared state to Zustand.
- Keep derived booleans close to use sites.
- Prefer explicit conditional rendering over deeply nested ternaries.
- Extend renderer/registry patterns instead of hardcoding one-off branches.

### Pipeline And Schema Changes

- Preserve pipeline stage semantics (`parsing`, `reasoning`, `building`, `rendering`, etc.).
- Keep quality retries bounded and deterministic.
- Keep LLM prompts clear about expected JSON-only responses.
- When schema contracts change, update both:
  - TS types in `src/types/pipeline.ts`
  - Prompt/schema text in parser/reasoner/generator stages

### Error Handling

- Fail fast on malformed external/LLM outputs.
- Wrap JSON parsing in `try/catch` with actionable messages.
- Do not silently swallow exceptions.
- Surface UI errors through store state (`setError`) so users see failures.

### Environment And Secrets

- Required env var: `VITE_OLLAMA_API_KEY`.
- Optional env var: `VITE_OLLAMA_MODEL`.
- Never hardcode secrets.
- Never commit `.env` contents or credentials.

## Agent Workflow Checklist

- Read nearby files before changing behavior.
- Keep diffs focused on requested work.
- Run `npm run lint` after meaningful code changes.
- Run `npm run build` for type or pipeline changes.
- If tests are added, run single-test command first, then full suite.
- Do not perform broad refactors unless requested.

## Known Gaps

- No automated test suite configured yet.
- No Prettier/EditorConfig configuration currently in repo.
- No `.cursorrules` file or Copilot instruction file currently exists.
