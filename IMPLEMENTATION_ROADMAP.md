# Pico Implementation Roadmap

Pico = **Design Runtime for Coding Agents**. A design intelligence layer that sits between coding agents and UI output.

---

## Phase 1: Design Critic (Current Web App) ✅

**Status:** Implemented

The Design Critic Engine evaluates AI-generated UI against design laws and feeds corrections back into the generation loop.

- `src/pipeline/designCritic.ts` — AI critique pass
- Integrated into `pipeline.ts`: Generate → Critic → Retry with corrections
- New stage: `critiquing`
- PipelineDebugger shows critic output in a "Critic" tab

**Design laws evaluated:**
- Hierarchy (primary action, visual weight)
- Composition (avoid center-stack, edge anchoring)
- Rhythm (4/8/12/16/24/32/48 spacing scale)
- Interaction (thumb zones, 44px touch targets)
- Accessibility (WCAG AA contrast, readable sizes)
- Product archetype (dashboard ≠ landing ≠ tool)

---

## Phase 2: Electron Desktop App + Auth + Codex

**Status:** Auth + LayoutShell implemented. New architecture: EventBus, streaming Codex + Pico, two-column compare.

### New Architecture (Phase 2.5)

**Dataflow:** User prompt → Run Config Builder → Codex (baseline) + Pico (critic → director → rewriter) → Compare Layer

**Electron Main:**
- `eventBus.ts` — In-memory pubsub keyed by runId, forwards to renderer via IPC
- `run.ts` — run.start, run.cancel, wires Codex + Pico
- `codexStreaming.ts` — Spawns codex exec, streams stdout, extracts code from output
- `picoStreaming.ts` — Critic → Director → Rewriter with callLLMNode (Ollama/OpenAI)
- `llmNode.ts` — Node LLM client (Ollama localhost, OpenAI API key)

**Stream Event Schema:** `{ runId, ts, source, kind, stage, message?, meta? }` — source: codex|pico|system, kind: status|thought|tool|code|diff|preview|error

**Renderer:** `LayoutShell.tsx` — Sidebar (run controls, scores) + Codex column (Code/Stream tabs) + Pico column (Code/Stream tabs)

### 2.1 Auth Module

Two sign-in modes for v0:

| Mode | Flow | Storage |
|------|------|---------|
| **Sign in with ChatGPT** | Device code flow (no embedded browser) | macOS Keychain via `keytar` |
| **Use API key** | Paste key, validate with test call | macOS Keychain via `keytar` |

**Auth state machine:**
- `signedOut` → `pendingDeviceAuth` (device code shown) → `signedIn`
- `signedIn` (apiKey) vs `signedIn` (chatgpt)
- `error` on failure

**Sign in with ChatGPT (device code):**
1. User clicks "Sign in with ChatGPT"
2. Main process requests device code from OpenAI
3. Renderer shows code + verification URL
4. User completes sign-in in system browser
5. Main polls until authorized
6. Store refresh token in Keychain

**Use API key:**
1. User pastes key
2. Validate with tiny test call
3. Store in Keychain
4. Mark session as `apiKey` mode

**Why device code for ChatGPT:**
- No embedded browser complexity
- No localhost callback / loopback port issues
- Works reliably in Electron
- Codex CLI supports device auth

### 2.2 Electron Skeleton

**Architecture:**
- Main process: AuthService, CodexService, SecureStore
- Renderer: UI only
- IPC bridges actions

**Modules:**
- `AuthService` (main) — device code + API key flows
- `CodexService` (main) — run Codex tasks, stream events
- `SecureStore` (main) — Keychain via `keytar`

### 2.3 Codex Runner

**Option A: Wrap Codex CLI** (recommended for v0)
- Install or bundle Codex CLI
- Spawn from main process
- Pros: Fastest to ship, matches Codex behaviors
- Cons: Process management, sandboxing

**Option B: Call OpenAI APIs directly**
- Use OpenAI API with user credential
- Pros: Full control, easier to instrument compare loop
- Cons: Must implement more of agent loop

### 2.4 Product Loop: Compare View

**UI:**
```
┌──────────────────────────────────────────┐
│ Raw (Codex)     │ Pico Improved          │
│                 │                         │
│ default output  │ design opinions applied │
└──────────────────────────────────────────┘

Design Decisions:
✓ hierarchy fixed
✓ spacing system applied
✓ accessibility improved
```

**Pipeline:**
1. User prompt → Codex generates UI
2. Pico critic pass → patch plan
3. Pico applies patch or regenerates with constraints
4. Show diffs

### 2.5 Local Workspace Picker

- Pick a folder
- Index files for context
- Send to Codex runner

---

## Implementation Order

1. **Auth first** — everything depends on it
   - AuthService with two buttons: "Sign in with ChatGPT" | "Use API key"
   - Device code flow for ChatGPT
   - API key validation and storage

2. **Codex runner** — thin adapter, stream events into Pico

3. **Workspace picker** — folder selection, file indexing

4. **Compare view** — left raw, right Pico-improved

---

## Constraints

- **ChatGPT sign-in:** App leverages Codex auth behavior and policies from that sign-in method
- **API key mode:** Add as second option for users who prefer usage-based access
- **Code signing / notarization:** Required for macOS distribution (Electron runs on Intel and Apple Silicon)

---

## Key Insight

The moat is not the initial ruleset but the system that turns taste into a deterministic second pass. Every model becomes better inside Pico's environment.
