import type { InterfaceSurface, LayoutNode, ProductType } from '../types/pipeline'

export interface SurfaceDefinition {
    label: string
    firstViewLabel: string
    explorationPrompt: string
    expansionSections: string[]
    expansionPrompt: string
}

export interface ScreenContent {
    headline: string
    subheadline: string
    ctaPrimary: string
    ctaSecondary: string | null
    navItems: string[]
    metrics: Array<{ label: string; value: string }>
    listItems: string[]
    featureLabels: string[]
    backgroundTreatment: 'solid' | 'gradient' | 'mesh'
}

export const SURFACE_DEFINITIONS: Record<InterfaceSurface, SurfaceDefinition> = {
    marketing: {
        label: 'Marketing Interface',
        firstViewLabel: 'Landing page',
        explorationPrompt:
            'Design the primary landing screen — hero with navigation and one supporting section below. This must look like a real product page, not a wireframe. Include the nav bar, hero with headline and CTA, and a feature or trust section below the fold.',
        expansionSections: [
            'Hero', 'Feature highlights', 'Social proof / testimonials',
            'Pricing or value breakdown', 'Call-to-action', 'Footer',
        ],
        expansionPrompt:
            'Expand into a complete marketing page. Sections flow vertically: hero → features → social proof → pricing → CTA → footer. Each section should reinforce the brand story.',
    },
    analytical: {
        label: 'Analytical Interface',
        firstViewLabel: 'Dashboard overview',
        explorationPrompt:
            'Design the dashboard overview — the command center with sidebar navigation, KPI row, chart area, data table, and live activity feed. This must look like a shippable analytics product, not a skeleton.',
        expansionSections: [
            'Overview header with KPIs', 'Primary data visualization',
            'Detail tables / feeds', 'Filters and controls',
            'Secondary analytics', 'Activity log',
        ],
        expansionPrompt:
            'Expand into a complete analytical dashboard. Layout uses panels and data blocks: overview KPIs → charts → data tables → activity feeds. Prioritize information density and scanability.',
    },
    mobile: {
        label: 'Mobile Interface',
        firstViewLabel: 'Home screen',
        explorationPrompt:
            'Design the full home screen — top bar, primary content card, scrollable list, and bottom navigation. This must look like a real mobile app screenshot, not a placeholder.',
        expansionSections: [
            'Home screen with primary action', 'Content feed or list view',
            'Detail view', 'Navigation structure',
            'Settings / profile', 'Empty and loading states',
        ],
        expansionPrompt:
            'Expand into a complete mobile app structure. Design as sequential screens: home → content list → detail → settings. Keep touch targets large, content focused, and navigation minimal.',
    },
    immersive: {
        label: 'Immersive Interface',
        firstViewLabel: 'Main view / HUD',
        explorationPrompt:
            'Design the main view — full-bleed atmospheric hero with HUD-style status overlays, menu items, and action buttons. This must feel like a real game or immersive app, not a wireframe.',
        expansionSections: [
            'Main viewport / canvas', 'HUD overlays and status',
            'Menu system', 'Inventory / selection panels',
            'Notification / event system', 'Settings / preferences',
        ],
        expansionPrompt:
            'Expand into a complete immersive UI system. Design as layered overlays: main viewport → HUD elements → menu systems → inventory panels. Minimize chrome, maximize atmosphere.',
    },
    workspace: {
        label: 'Creative Workspace',
        firstViewLabel: 'Workspace shell',
        explorationPrompt:
            'Design the workspace shell — sidebar project browser, center canvas or editor area, and a toolbar or tab bar. This must look like a real productivity tool, not an empty frame.',
        expansionSections: [
            'Workspace shell with toolbar', 'Primary canvas or editor',
            'Side panels / inspectors', 'File or project browser',
            'Properties and settings', 'Output / preview area',
        ],
        expansionPrompt:
            'Expand into a complete workspace tool. Layout uses panels around a central canvas: toolbar → sidebar → canvas → inspector. Prioritize keyboard-driven workflow and spatial stability.',
    },
}

const PRODUCT_TO_SURFACE: Record<ProductType, InterfaceSurface> = {
    landing: 'marketing',
    portfolio: 'marketing',
    ecommerce: 'marketing',
    dashboard: 'analytical',
    admin: 'analytical',
    feed: 'analytical',
    'mobile-app': 'mobile',
    onboarding: 'mobile',
    form: 'mobile',
    portal: 'immersive',
    documentation: 'workspace',
    tool: 'workspace',
    settings: 'workspace',
}

const VALID_SURFACES = new Set<string>([
    'marketing', 'analytical', 'mobile', 'immersive', 'workspace',
])

export function resolveSurface(
    llmSurface: string | undefined,
    productType: ProductType,
): InterfaceSurface {
    if (llmSurface && VALID_SURFACES.has(llmSurface)) {
        return llmSurface as InterfaceSurface
    }
    return PRODUCT_TO_SURFACE[productType] ?? 'marketing'
}

export function getSurfaceDefinition(surface: InterfaceSurface): SurfaceDefinition {
    return SURFACE_DEFINITIONS[surface]
}

export function buildFirstScreen(
    surface: InterfaceSurface,
    content: ScreenContent,
    brand: string,
): LayoutNode {
    switch (surface) {
        case 'marketing':
            return buildMarketingScreen(content, brand)
        case 'analytical':
            return buildAnalyticalScreen(content, brand)
        case 'mobile':
            return buildMobileScreen(content, brand)
        case 'immersive':
            return buildImmersiveScreen(content, brand)
        case 'workspace':
            return buildWorkspaceScreen(content, brand)
    }
}

function buildMarketingScreen(c: ScreenContent, brand: string): LayoutNode {
    return {
        component: 'Shell',
        children: [
            {
                component: 'TopNav',
                props: {
                    title: brand,
                    links: c.navItems.slice(0, 5),
                    ctaLabel: c.ctaPrimary,
                },
            },
            {
                component: 'PageContent',
                children: [
                    {
                        component: 'HeroSection',
                        props: {
                            headline: c.headline,
                            subheadline: c.subheadline,
                            ctaPrimary: c.ctaPrimary,
                            ctaSecondary: c.ctaSecondary,
                            backgroundTreatment: c.backgroundTreatment,
                            layout: 'left-aligned',
                        },
                    },
                    {
                        component: 'FeatureGrid',
                        props: {
                            title: c.featureLabels.length > 0 ? 'Why ' + brand : 'Features',
                            features: c.featureLabels.slice(0, 4),
                        },
                    },
                ],
            },
        ],
    }
}

function buildAnalyticalScreen(c: ScreenContent, brand: string): LayoutNode {
    return {
        component: 'Shell',
        children: [
            {
                component: 'Sidebar',
                children: c.navItems.slice(0, 6).map((item, i) => ({
                    component: 'NavItem' as const,
                    props: { label: item, active: i === 0 },
                })),
            },
            {
                component: 'MainContent',
                children: [
                    {
                        component: 'Header',
                        props: { title: c.headline || brand, subtitle: c.subheadline },
                    },
                    {
                        component: 'KPIRow',
                        props: { items: c.metrics.slice(0, 4) },
                    },
                    {
                        component: 'ChartBlock',
                        props: { type: 'line', title: 'Performance' },
                    },
                    {
                        component: 'DataTable',
                        props: {
                            title: 'Recent',
                            columns: c.metrics.slice(0, 3).map(m => m.label),
                            rows: [c.metrics.slice(0, 3).map(m => m.value)],
                        },
                    },
                    ...(c.listItems.length > 0 ? [{
                        component: 'ActivityFeed' as const,
                        props: {
                            title: 'Activity',
                            events: c.listItems.slice(0, 4),
                        },
                    }] : []),
                ],
            },
        ],
    }
}

function buildMobileScreen(c: ScreenContent, brand: string): LayoutNode {
    return {
        component: 'Shell',
        children: [
            {
                component: 'TopNav',
                props: {
                    title: brand,
                    links: [],
                    ctaLabel: c.ctaPrimary,
                },
            },
            {
                component: 'MainContent',
                children: [
                    {
                        component: 'Header',
                        props: { title: c.headline, subtitle: c.subheadline },
                    },
                    ...(c.metrics.length > 0 ? [{
                        component: 'KPIRow' as const,
                        props: { items: c.metrics.slice(0, 4) },
                    }] : []),
                    {
                        component: 'Card',
                        props: { title: c.featureLabels[0] || 'Quick Actions' },
                        children: c.featureLabels.slice(1, 4).map(label => ({
                            component: 'Button' as const,
                            props: { label },
                        })),
                    },
                    ...(c.listItems.length > 0 ? [{
                        component: 'ActivityFeed' as const,
                        props: {
                            title: 'Recent',
                            events: c.listItems.slice(0, 5),
                        },
                    }] : []),
                ],
            },
        ],
    }
}

function buildImmersiveScreen(c: ScreenContent, brand: string): LayoutNode {
    return {
        component: 'Shell',
        children: [
            {
                component: 'MainContent',
                children: [
                    {
                        component: 'HeroSection',
                        props: {
                            headline: c.headline || brand,
                            subheadline: c.subheadline,
                            ctaPrimary: c.ctaPrimary,
                            ctaSecondary: c.ctaSecondary,
                            backgroundTreatment: c.backgroundTreatment,
                            layout: 'fullbleed',
                        },
                    },
                    ...(c.metrics.length > 0 ? [{
                        component: 'KPIRow' as const,
                        props: { items: c.metrics.slice(0, 4) },
                    }] : []),
                    {
                        component: 'WorkGrid',
                        props: {
                            title: c.featureLabels[0] || 'Actions',
                            projects: c.featureLabels.slice(0, 6),
                        },
                    },
                ],
            },
        ],
    }
}

function buildWorkspaceScreen(c: ScreenContent, brand: string): LayoutNode {
    return {
        component: 'Shell',
        children: [
            {
                component: 'Sidebar',
                children: c.navItems.slice(0, 6).map((item, i) => ({
                    component: 'NavItem' as const,
                    props: { label: item, active: i === 0 },
                })),
            },
            {
                component: 'MainContent',
                children: [
                    {
                        component: 'Header',
                        props: { title: c.headline || brand, subtitle: c.subheadline },
                    },
                    ...(c.featureLabels.length > 1 ? [{
                        component: 'Tabs' as const,
                        props: { tabs: c.featureLabels.slice(0, 5) },
                    }] : []),
                    {
                        component: 'Card',
                        props: { title: 'Canvas' },
                        children: [{
                            component: 'ChartBlock' as const,
                            props: { type: 'area', title: '' },
                        }],
                    },
                    ...(c.listItems.length > 0 ? [{
                        component: 'ActivityFeed' as const,
                        props: {
                            title: 'Recent',
                            events: c.listItems.slice(0, 4),
                        },
                    }] : []),
                ],
            },
        ],
    }
}
