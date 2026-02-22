import { callLLM, extractJSON } from '../lib/llm'
import type { IntentJSON, LayoutNode } from '../types/pipeline'
import type { Exploration } from './explorationEngine'
import { getSurfaceDefinition } from './surfaceConfig'
import { resolveArchetype, formatArchetypeForPrompt } from './productArchetypes'

function buildExpansionPrompt(intent: IntentJSON): string {
    const surfaceDef = getSurfaceDefinition(intent.surface)
    const archetype = resolveArchetype(intent)

    return `You are Pico in execution mode.
You are a product designer, NOT a coding assistant.
You design for ANY type of digital interface — not just websites.

You are expanding a chosen direction into a complete ${surfaceDef.label}.
${surfaceDef.expansionPrompt}

${formatArchetypeForPrompt(archetype)}

The user already chose a visual direction with a first screen preview.
You must BUILD ON that foundation — keep the same content style and add more sections.
The expanded page must feel like a COMPLETE PRODUCT, not a collection of components.

Target sections for this surface:
${surfaceDef.expansionSections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Rules:
- Preserve the chosen visual DNA and content tone from the first screen.
- Keep section hierarchy coherent and surface-appropriate.
- Include realistic, domain-specific content. No placeholders.
- Every required module from the archetype must be represented somewhere in the expanded view.
- Adapt component usage to the interface category:
  - Marketing: hero, features, testimonials, pricing, CTA, footer
  - Analytical: KPI rows, charts, data tables, activity feeds, filters
  - Mobile: stacked cards, list views, action buttons, navigation bars
  - Immersive: full-bleed sections, overlays, status bars, spatial layouts
  - Workspace: toolbars, canvas areas, side panels, property inspectors
- Return ONLY valid JSON. No explanation, no markdown.

Return a JSON array of section objects. Each object has:
- "component": one of Header, HeroSection, WorkGrid, FeatureGrid, CTASection, FooterSection, Card, MetricCard, KPIRow, DataTable, ActivityFeed, Tabs, Button, Badge, Divider
- "props": object with component-specific props and realistic data`
}

function extractChildren(parsed: unknown): LayoutNode[] | null {
    if (Array.isArray(parsed)) {
        return parsed as LayoutNode[]
    }

    if (parsed && typeof parsed === 'object') {
        const obj = parsed as Record<string, unknown>

        if ('component' in obj) {
            return [obj as unknown as LayoutNode]
        }

        if (Array.isArray(obj.children) && obj.children.length > 0) {
            return obj.children as LayoutNode[]
        }

        if (Array.isArray(obj.sections) && obj.sections.length > 0) {
            return obj.sections as LayoutNode[]
        }

        if (Array.isArray(obj.layout) && obj.layout.length > 0) {
            return obj.layout as LayoutNode[]
        }

        for (const val of Object.values(obj)) {
            if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null && 'component' in val[0]) {
                return val as LayoutNode[]
            }
        }
    }

    return null
}

function asLayoutTree(raw: string): LayoutNode | null {
    const parsed = JSON.parse(extractJSON(raw)) as unknown
    const children = extractChildren(parsed)

    if (!children || children.length === 0) return null

    return {
        component: 'MainContent',
        children,
    }
}

function fallbackExpandedLayout(exploration: Exploration, intent: IntentJSON): LayoutNode {
    const s = exploration.screen
    const surfaceDef = getSurfaceDefinition(intent.surface)

    const surfaceFallbacks: Record<string, LayoutNode[]> = {
        marketing: [
            {
                component: 'HeroSection',
                props: {
                    headline: s.headline,
                    subheadline: s.subheadline,
                    ctaPrimary: s.ctaPrimary,
                    ctaSecondary: s.ctaSecondary,
                    backgroundTreatment: s.backgroundTreatment,
                    layout: 'left-aligned',
                },
            },
            {
                component: 'FeatureGrid',
                props: { title: 'What we offer', features: s.featureLabels },
            },
            {
                component: 'CTASection',
                props: { title: 'Take the next step', subtitle: exploration.philosophy, ctaLabel: s.ctaPrimary },
            },
            {
                component: 'FooterSection',
                props: { brand: intent.domain, links: s.navItems.slice(0, 5) },
            },
        ],
        analytical: [
            {
                component: 'Header',
                props: { title: s.headline || intent.domain, subtitle: s.subheadline || surfaceDef.firstViewLabel },
            },
            {
                component: 'KPIRow',
                props: { items: s.metrics.slice(0, 4) },
            },
            {
                component: 'ChartBlock',
                props: { type: 'line', title: 'Performance' },
            },
            {
                component: 'DataTable',
                props: {
                    title: 'Recent',
                    columns: s.metrics.slice(0, 3).map(m => m.label),
                    rows: [s.metrics.slice(0, 3).map(m => m.value)],
                },
            },
            {
                component: 'ActivityFeed',
                props: { title: 'Activity', events: s.listItems.slice(0, 5) },
            },
        ],
        mobile: [
            {
                component: 'Header',
                props: { title: s.headline, subtitle: s.subheadline },
            },
            {
                component: 'KPIRow',
                props: { items: s.metrics.slice(0, 4) },
            },
            {
                component: 'Card',
                props: { title: s.featureLabels[0] || 'Actions' },
            },
            {
                component: 'ActivityFeed',
                props: { title: 'Recent', events: s.listItems.slice(0, 5) },
            },
        ],
        immersive: [
            {
                component: 'HeroSection',
                props: {
                    headline: s.headline,
                    subheadline: s.subheadline,
                    ctaPrimary: s.ctaPrimary,
                    backgroundTreatment: s.backgroundTreatment,
                    layout: 'fullbleed',
                },
            },
            {
                component: 'KPIRow',
                props: { items: s.metrics.slice(0, 4) },
            },
            {
                component: 'WorkGrid',
                props: { title: intent.domain, projects: s.featureLabels },
            },
        ],
        workspace: [
            {
                component: 'Header',
                props: { title: s.headline || intent.domain, subtitle: s.subheadline },
            },
            {
                component: 'Tabs',
                props: { tabs: s.featureLabels.slice(0, 5) },
            },
            {
                component: 'Card',
                props: { title: 'Canvas' },
            },
            {
                component: 'ActivityFeed',
                props: { title: 'Recent', events: s.listItems.slice(0, 4) },
            },
        ],
    }

    return {
        component: 'MainContent',
        children: surfaceFallbacks[intent.surface] ?? surfaceFallbacks.marketing!,
    }
}

export async function expandExploration(exploration: Exploration, intent: IntentJSON): Promise<LayoutNode> {
    const systemPrompt = buildExpansionPrompt(intent)
    const tokenSnapshot = {
        colors: exploration.tokens.colors,
        typography: exploration.tokens.typography,
        radius: exploration.tokens.radius,
        shadow: exploration.tokens.shadow,
    }
    const userMessage = `Return ONLY a JSON array of sections.\n\nChosen direction:\nTitle: ${exploration.title}\nPhilosophy: ${exploration.philosophy}\nCreative seed: ${exploration.seed.directive}\n\nVisual DNA (use these to inform content tone and density):\n${JSON.stringify(tokenSnapshot, null, 2)}\n\nFirst screen content (build on this foundation):\n${JSON.stringify(exploration.screen, null, 2)}\n\nInterface surface: ${intent.surface} (${getSurfaceDefinition(intent.surface).label})\n\nProduct intent:\n${JSON.stringify(intent, null, 2)}`

    try {
        const firstRaw = await callLLM(systemPrompt, userMessage)
        const tree = asLayoutTree(firstRaw)
        if (tree) return tree
    } catch { /* retry below */ }

    try {
        const retryRaw = await callLLM(systemPrompt, `Your previous output was not usable. Return ONLY a valid JSON array of section objects, each with "component" and "props" keys.\n\n${userMessage}`)
        const tree = asLayoutTree(retryRaw)
        if (tree) return tree
    } catch { /* fallback below */ }

    return fallbackExpandedLayout(exploration, intent)
}
