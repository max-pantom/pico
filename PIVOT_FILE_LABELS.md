# Pivot File Labels

**Pivot:** Pico shifts from generator → governor. Assets that classify intent, enforce taste, measure quality, and steer the agent win. Assets that draw interfaces become legacy.

**Criteria for KEEP/REPURPOSE:**
- A: Classify what the UI is
- B: Generate multiple directions from same intent
- C: Critique and score quality (including accessibility)
- D: Rewrite code to improve design
- E: Compare and iterate

---

## KEEP (core building blocks)

| File | Reason |
|------|--------|
| `pipeline/productArchetypes.ts` | **A** — Classifies product type and surface; determines which rules/archetype apply to the critic and rewrite prompts. |
| `pipeline/designWorlds.ts` | **B** — Seed library becomes "opinion packs" for critic and rewrite; `pickDivergentSeeds`, `pickReplacementSeed`, `formatSeedForPrompt` drive "regenerate with different opinion pack". |
| `pipeline/designCritic.ts` | **C, D** — Core critic engine; evaluates against design laws, accessibility, hierarchy; feeds corrections into rewrite loop. |
| `pipeline/qualityGate.ts` | **C** — Guardrail layer; deterministic scoring and structural checks; part of critic rubric. |
| `pipeline/intentParser.ts` | **A** — Parses prompt into structured intent; needed to classify UI and seed prompts for Codex. |
| `pipeline/surfaceConfig.ts` | **A, B** — Surface definitions and prompts; seeds become prompts for Codex, not direct generation. |
| `app/DirectionList.tsx` | **B, E** — Divergence picker + New Directions; repurpose to "regenerate with different opinion pack". |
| `app/CompareView.tsx` | **E** — Side-by-side compare; core pivot UI (Raw vs Pico Improved). |
| `app/ElectronShell.tsx` | **E** — Desktop shell; auth + compare view container. |
| `app/AuthGate.tsx` | **E** — Auth for Codex; required for desktop flow. |
| `store/picoStore.ts` | **E** — Shared state for compare, directions, mode. |
| `store/engineStore.ts` | **E** — Engine state; may need trimming for pivot. |
| `lib/llm.ts` | **C, D** — LLM client; used by critic, rewriter, and future Codex prompts. |
| `types/pipeline.ts` | **All** — Core type contracts; keep and trim to pivot needs. |
| `types/electron.d.ts` | **E** — Electron IPC types. |
| `index.css` | **E** — Base styles. |
| `main.tsx` | **E** — Entry point. |

---

## MODIFY / REPURPOSE

| File | Current Role | Pivot Role |
|------|--------------|------------|
| `pipeline/explorationEngine.ts` | Generates UI explorations via LLM + internal layout. | **Run configurations engine:** selects seeds, builds prompts for Codex, runs critic, produces improved output, manages multiple directions. No longer generates UI; orchestrates Codex + critic loop. |
| `pipeline/expansionEngine.ts` | Extends chosen exploration into full layout via internal generation. | **Refine selected direction:** take chosen direction, ask Codex to extend UI, re-run critic, apply fixes. |
| `pipeline/deriveDecisions.ts` | Derives DesignDecisions from ExplorationTokens. | **Repurpose:** derive decisions from critic output or Codex output for scoring/rewrite prompts; may simplify or merge into critic. |
| `pipeline/compositionStrategies.ts` | Composition rules for internal layout. | **Repurpose:** feed into critic rubric and Codex prompt constraints; "composition laws" for evaluation and rewrite. |
| `pipeline/sceneStrategies.ts` | Scene blueprints for internal layout. | **Repurpose:** feed into critic rubric and Codex prompt constraints; scene expectations for evaluation. |
| `app/ExplorationGrid.tsx` | Grid of explorations from explorationEngine. | **Repurpose:** grid of "directions" from Codex + different seeds; same UX, different data source. |
| `pipeline/pipeline.ts` | Full generator pipeline: intent → reason → layout → critic → export. | **Heavily modify:** becomes orchestrator: intent → Codex (or raw) → critic → rewrite → compare. Remove layout generation; keep critic loop, add Codex runner integration. |

---

## ARCHIVE → `legacy-generation/`

| File | Reason |
|------|--------|
| `pipeline/layoutGenerator.ts` | **Archive** — LLM generates LayoutNode JSON for internal registry; Codex is now the builder. |
| `pipeline/layoutBuilder.ts` | **Archive** — Builds layout from internal content architecture; Pico no longer constructs layout tree. |
| `pipeline/tokenBuilder.ts` | **Archive** — Builds design tokens for internal renderer; Codex output is source of truth; tokens may come from critic/rewrite. |
| `pipeline/designReasoner.ts` | **Archive** — LLM design decisions for internal generation; critic + rewriter replace this role. |
| `pipeline/stateGenerator.ts` | **Archive** — Infers React state from internal layout; Codex generates code with state. |
| `pipeline/codeExporter.ts` | **Archive** — Exports from internal LayoutNode tree; export is now "resulting code" from Codex + corrections. |
| `lib/codeExporter.ts` | **Archive** — Alternative export path; same reason. |
| `renderer/ComponentRegistry.ts` | **Archive** — Registry for internal component tree; Codex generates components, not Pico. |
| `renderer/LayoutRenderer.tsx` | **Archive** — Renders internal LayoutNode tree; compare view may need to render Codex output (iframe/code preview) instead. |
| `renderer/ScreenPreview.tsx` | **Archive** — Previews exploration screens from internal render; repurpose only if we preview Codex output. |
| `renderer/surfaceRender.ts` | **Archive** — Surface dimensions; may keep if compare view needs aspect ratios for Codex preview. |
| `renderer/TokenInjector.tsx` | **Archive** — Injects tokens into internal render; not needed for Codex output. |
| `renderer/HeroRenderer.tsx` | **Archive** — Specialized hero renderer; internal only. |
| `renderer/LayerCanvasRenderer.tsx` | **Archive** — Frame/layer canvas; internal generation artifact. |
| `design/frameModel.ts` | **Archive** — Figma-like layer graph; pivot does not need frame mode. |
| `design/autoLayout.ts` | **Archive** — AutoLayout for frame model; frame mode archived. |
| `design/layerToComponent.ts` | **Archive** — DesignDocument → LayoutNode; frame mode archived. |
| `app/Canvas.tsx` | **Archive** — Canvas for internal layout; generation artifact. |
| `app/ExpandedView.tsx` | **Archive** — Expanded internal layout view; replace with Codex output preview. |
| `app/SectionNavigator.tsx` | **Archive** — Section nav for internal layout; generation artifact. |
| `app/PipelineDebugger.tsx` | **Archive** — Debugger for generator pipeline; repurpose later for critic/Codex debug if needed. |
| `app/PromptBar.tsx` | **Archive** — Prompt input for generator; may merge into CompareView toolbar. |
| `app/PromptInput.tsx` | **Archive** — Same. |
| `app/Sidebar.tsx` | **Archive** — Sidebar for generator UI; may keep if CompareView needs it. |
| `app/AppShell.tsx` | **Archive** — App shell for generator flow; pivot uses CompareView + ElectronShell. |
| `app/StatusIndicator.tsx` | **Archive** — Status for generator; may keep if CompareView needs status. |

---

## RENDERER COMPONENTS (all → `legacy-generation/renderer/components/`)

These exist to render internal LayoutNode trees. Codex generates UI; Pico does not render from registry.

| File | Reason |
|------|--------|
| `renderer/components/*.tsx` (all 25 files) | **Archive** — HeroSection, Card, DataTable, etc. Used by LayoutRenderer for internal generation. Codex output is standalone React; Pico compares raw vs improved code, does not render from registry. |

**Exception:** If CompareView needs to render Codex output in an iframe or sandbox, we keep a minimal preview harness—but not the full registry.

---

## SUGGESTED NEW FOLDER LAYOUT (from your spec)

```
src/
  main.tsx
  index.css
  types/
    pipeline.ts          # trim to pivot
    electron.d.ts
  agents/
    codexRunner.ts       # NEW: run Codex, stream events
  prompts/
    criticPrompt.ts      # extract from designCritic
    rewritePrompt.ts     # NEW: apply critic fixes to code
    seedsPrompt.ts       # extract from designWorlds + surfaceConfig
  pipeline/
    archetypes.ts        # rename productArchetypes
    seeds.ts             # rename designWorlds
    critic.ts            # rename designCritic
    rewriter.ts          # NEW: apply critic → code patches
    scoring.ts           # rename qualityGate
    intentParser.ts      # keep
    surfaceConfig.ts    # repurpose
    explorationEngine.ts # repurpose → run configs
    expansionEngine.ts   # repurpose → refine direction
    compositionStrategies.ts # repurpose
    sceneStrategies.ts   # repurpose
    deriveDecisions.ts   # repurpose or merge
  ui/
    renderer/            # minimal: compare preview only
    compare/             # CompareView, panels
    desktopShell/        # ElectronShell, AuthGate
  store/
    picoStore.ts
    engineStore.ts
  lib/
    llm.ts
  legacy-generation/     # everything archived
    ...
```

---

## SUMMARY

| Category | Count |
|----------|-------|
| **Keep** | 17 |
| **Modify/Repurpose** | 7 |
| **Archive** | 50+ (pipeline generators, renderer, design/frame, app shell pieces) |

**Next step:** Create `legacy-generation/` and move archived files there. Do not delete. Then refactor kept/repurposed files to the new layout.

---

## Migration Complete (2025-02-24)

All archived files have been moved to `src/legacy-generation/`. Imports updated. Build passes. The app still imports from legacy for CompareView and pipeline until the Codex runner replaces the generator flow.
