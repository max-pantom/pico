import { callLLM, extractJSON } from '../lib/llm'
import type { IntentJSON, InterfaceSurface, LayoutNode } from '../types/pipeline'
import type { Exploration } from './explorationEngine'
import { getSurfaceDefinition } from './surfaceConfig'
import { resolveArchetype } from './productArchetypes'

const SURFACE_COMPONENTS: Record<InterfaceSurface, string[]> = {
    marketing: [
        'HeroSection', 'FeatureGrid', 'CTASection', 'FooterSection',
        'Card', 'Header', 'Badge', 'Divider', 'Button', 'MetricCard',
    ],
    analytical: [
        'Header', 'KPIRow', 'ChartBlock', 'DataTable', 'ActivityFeed',
        'Tabs', 'Card', 'MetricCard', 'StatBlock', 'Badge', 'Divider', 'Button',
    ],
    mobile: [
        'Header', 'Card', 'Button', 'Badge', 'Tabs',
        'ActivityFeed', 'MetricCard', 'Divider', 'Input', 'FormGroup',
    ],
    workspace: [
        'Header', 'Tabs', 'Card', 'ChartBlock', 'DataTable',
        'ActivityFeed', 'Button', 'Badge', 'Divider', 'Input', 'FormGroup',
    ],
    immersive: [
        'HeroSection', 'Card', 'KPIRow', 'Badge', 'Button',
        'WorkGrid', 'Divider', 'MetricCard', 'StatBlock',
    ],
}

const SURFACE_STRUCTURE_GUIDANCE: Record<InterfaceSurface, string> = {
    marketing: `Generate vertical page sections that scroll naturally: hero → features → social proof → pricing → call-to-action → footer.
Each section is a standalone block with its own background treatment and content.
This should read like a polished product marketing page.`,

    analytical: `Generate dashboard content panels for the MAIN content area (no sidebar or top nav — those are provided by the shell).
Start with a Header, then KPI summary, then charts and data tables, then activity feeds.
Content must be domain-specific data — real-looking metrics, chart labels, and table columns relevant to the product.
DO NOT generate marketing sections like HeroSection, CTASection, or FooterSection.`,

    mobile: `Generate MOBILE APP SCREENS — not website sections.
Each top-level object represents a SCREEN in the app (like Home, Detail, Camera, Gallery, Settings).
Wrap each screen's content in a Card with a title that names the screen.
Use mobile-appropriate patterns:
- Large touch-friendly buttons (not tiny links)
- Simple lists and cards (not data tables or charts)
- One primary action per screen
- Bottom navigation is handled by the shell — don't generate navigation components
DO NOT generate HeroSection, CTASection, FooterSection, KPIRow, DataTable, or ChartBlock.
DO NOT generate website-style sections. This is an APP, not a website.
All content must relate to the actual app functionality — not server metrics or marketing copy.`,

    workspace: `Generate workspace PANELS for the main editor area (no sidebar or toolbar — those are provided by the shell).
Start with a Header showing the current document/project name.
Then show the primary canvas/editor content as a large Card.
Then show property panels, output/preview areas, or secondary tools.
Content should reflect the actual tool functionality.
DO NOT generate marketing sections like HeroSection, CTASection, or FooterSection.`,

    immersive: `Generate a full-bleed immersive experience.
Start with a large HeroSection as the main viewport/scene.
Then overlay-style panels: HUD status (KPIRow), action grid (WorkGrid), inventory/selection panels.
Everything should feel atmospheric and game-like — not corporate or marketing.
DO NOT generate FooterSection or CTASection.`,
}

function buildExpansionPrompt(intent: IntentJSON): string {
    const surfaceDef = getSurfaceDefinition(intent.surface)
    const archetype = resolveArchetype(intent)
    const allowedComponents = SURFACE_COMPONENTS[intent.surface]
    const structureGuide = SURFACE_STRUCTURE_GUIDANCE[intent.surface]

    return `You are Pico in execution mode.
You are a product designer, NOT a coding assistant.

You are expanding a chosen direction into a complete ${surfaceDef.label}.

CONTEXT (inform your thinking — surface awareness kicks in here, but softly):
This is a ${surfaceDef.label}. The first view is typically ${surfaceDef.firstViewLabel}.
${surfaceDef.expansionPrompt}

Consider what makes sense for this context — but do not abandon the chosen visual DNA.
Let the visual identity win if there's a conflict.

Archetype: ${archetype.description}
Modules that may matter: ${archetype.requiredModules.join(', ')}. Represent them where the visual identity allows.

STRUCTURAL GUIDE (gentle context, not command):
${structureGuide}

Target sections (consider these, adapt as the direction demands):
${surfaceDef.expansionSections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

ALLOWED COMPONENTS (use ONLY these):
${allowedComponents.join(', ')}

Rules:
- Preserve the chosen visual DNA and content tone from the first screen completely.
- Generate sections that serve BOTH the ${intent.surface} context AND the chosen visual identity.
- If there's a conflict, the visual identity wins.
- ALL content must be realistic, domain-specific, and relevant to the actual product.
- Return ONLY valid JSON. No explanation, no markdown.

Return a JSON array of section objects. Each object has:
- "component": one of ${allowedComponents.join(', ')}
- "props": object with component-specific props and realistic data
- "children": optional array of child component objects`
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

    const surfaceFallbacks: Record<InterfaceSurface, LayoutNode[]> = {
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
                component: 'Card',
                props: { title: s.featureLabels[0] || 'Home' },
                children: [
                    {
                        component: 'Header',
                        props: { title: s.headline, subtitle: s.subheadline },
                    },
                    {
                        component: 'Button',
                        props: { label: s.ctaPrimary },
                    },
                ],
            },
            {
                component: 'Card',
                props: { title: s.featureLabels[1] || 'Browse' },
                children: [
                    {
                        component: 'ActivityFeed',
                        props: { title: 'Recent', events: s.listItems.slice(0, 4) },
                    },
                ],
            },
            {
                component: 'Card',
                props: { title: s.featureLabels[2] || 'Settings' },
                children: s.navItems.slice(0, 4).map(item => ({
                    component: 'Button' as const,
                    props: { label: item },
                })),
            },
        ],
        immersive: [
            {
                component: 'HeroSection',
                props: {
                    headline: s.headline,
                    subheadline: s.subheadline,
                    ctaPrimary: s.ctaPrimary,
                    backgroundTreatment: 'mesh',
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
                children: [{
                    component: 'ChartBlock' as const,
                    props: { type: 'area', title: '' },
                }],
            },
            {
                component: 'ActivityFeed',
                props: { title: 'Recent', events: s.listItems.slice(0, 4) },
            },
        ],
    }

    return {
        component: 'MainContent',
        children: surfaceFallbacks[intent.surface] ?? surfaceFallbacks.marketing,
    }
}

function wrapInSurfaceShell(
    content: LayoutNode,
    exploration: Exploration,
    intent: IntentJSON,
): LayoutNode {
    const s = exploration.screen
    const contentChildren = content.children ?? [content]

    switch (intent.surface) {
        case 'analytical':
            return {
                component: 'Shell',
                children: [
                    {
                        component: 'Sidebar',
                        children: s.navItems.slice(0, 6).map((item, i) => ({
                            component: 'NavItem' as const,
                            props: { label: item, active: i === 0 },
                        })),
                    },
                    {
                        component: 'MainContent',
                        children: contentChildren,
                    },
                ],
            }
        case 'workspace':
            return {
                component: 'Shell',
                children: [
                    {
                        component: 'Sidebar',
                        children: s.navItems.slice(0, 6).map((item, i) => ({
                            component: 'NavItem' as const,
                            props: { label: item, active: i === 0 },
                        })),
                    },
                    {
                        component: 'MainContent',
                        children: contentChildren,
                    },
                ],
            }
        case 'mobile':
        case 'marketing':
        case 'immersive':
        default:
            return {
                component: 'MainContent',
                children: contentChildren,
            }
    }
}

export async function expandExploration(exploration: Exploration, intent: IntentJSON): Promise<LayoutNode> {
    const systemPrompt = buildExpansionPrompt(intent)
    const surfaceDef = getSurfaceDefinition(intent.surface)
    const tokenSnapshot = {
        colors: exploration.tokens.colors,
        typography: exploration.tokens.typography,
        radius: exploration.tokens.radius,
        shadow: exploration.tokens.shadow,
    }
    const userMessage = `Return ONLY a JSON array of sections.

Chosen direction: ${exploration.seed.name} — ${exploration.title}
Philosophy: ${exploration.philosophy}

Creative seed (this is your authority — honor it completely):
${exploration.seed.directive}

Visual DNA (use these to inform content tone and density):
${JSON.stringify(tokenSnapshot, null, 2)}

First screen content (build on this foundation):
${JSON.stringify(exploration.screen, null, 2)}

Context: This is being expanded as a ${surfaceDef.label}. Consider what makes sense for that context — but let the ${exploration.seed.name} visual identity win if there's a conflict.

Product intent:
${JSON.stringify(intent, null, 2)}`

    try {
        const firstRaw = await callLLM(systemPrompt, userMessage)
        const tree = asLayoutTree(firstRaw)
        if (tree) return wrapInSurfaceShell(tree, exploration, intent)
    } catch { /* retry below */ }

    try {
        const retryRaw = await callLLM(systemPrompt, `Your previous output was not usable. Return ONLY a valid JSON array of section objects, each with "component" and "props" keys. ALLOWED COMPONENTS: ${SURFACE_COMPONENTS[intent.surface].join(', ')}.\n\n${userMessage}`)
        const tree = asLayoutTree(retryRaw)
        if (tree) return wrapInSurfaceShell(tree, exploration, intent)
    } catch { /* fallback below */ }

    const fallback = fallbackExpandedLayout(exploration, intent)
    return wrapInSurfaceShell(fallback, exploration, intent)
}
