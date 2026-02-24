# Legacy Generation

Archived code from the pre-pivot Pico. These modules existed to **generate** UI end-to-end from prompts. The pivot turns Pico into a **governor**—orchestrating Codex, applying critic/rewrite, and comparing output—so generation is delegated to the agent.

**Do not delete.** Reuse pieces when:
- Adding multi-agent support
- Reintroducing "frame mode" as an optional view
- Extracting patterns for Codex prompts

## Contents

- **pipeline/** — layoutGenerator, layoutBuilder, tokenBuilder, designReasoner, stateGenerator, codeExporter
- **renderer/** — ComponentRegistry, LayoutRenderer, ScreenPreview, surfaceRender, TokenInjector, HeroRenderer, LayerCanvasRenderer, safeValue, components/*
- **design/** — frameModel, autoLayout, layerToComponent
- **app/** — Canvas, ExpandedView, SectionNavigator, PipelineDebugger, PromptBar, PromptInput, Sidebar, AppShell, StatusIndicator
- **lib/** — codeExporter (alternative export)

## Active Imports

The main app still imports from here:
- `pipeline.ts` → legacy pipeline modules (until Codex runner replaces)
- `CompareView` → LayoutRenderer
- `ExplorationGrid` → ScreenPreview, surfaceRender
- `types/pipeline.ts` → frameModel types
- `explorationEngine` → frameModel, surfaceRender
