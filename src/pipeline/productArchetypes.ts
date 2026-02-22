import type { IntentJSON, InterfaceSurface } from '../types/pipeline'

export interface ProductArchetype {
    keywords: string[]
    surface: InterfaceSurface
    requiredModules: string[]
    layout: string
    description: string
}

const ARCHETYPES: ProductArchetype[] = [
    {
        keywords: ['camera', 'photo', 'photography', 'capture'],
        surface: 'immersive',
        requiredModules: ['live-preview', 'capture-control', 'mode-switcher', 'gallery-access', 'camera-toggle'],
        layout: 'fullscreen-overlay',
        description: 'Fullscreen camera interface with live viewfinder, shutter, mode carousel, and gallery thumbnail.',
    },
    {
        keywords: ['dashboard', 'analytics', 'monitoring', 'metrics'],
        surface: 'analytical',
        requiredModules: ['sidebar-nav', 'metric-row', 'chart', 'data-table', 'activity-feed'],
        layout: 'shell',
        description: 'Command-center overview with navigation, KPIs, primary chart, data table, and live activity.',
    },
    {
        keywords: ['messaging', 'chat', 'conversation', 'slack', 'discord'],
        surface: 'mobile',
        requiredModules: ['conversation-list', 'message-thread', 'input-bar', 'avatar-indicators', 'unread-badges'],
        layout: 'split',
        description: 'Messaging interface with conversation list, active thread, composer, avatars, and status.',
    },
    {
        keywords: ['design', 'figma', 'editor', 'canvas', 'whiteboard'],
        surface: 'workspace',
        requiredModules: ['canvas-area', 'tool-panel', 'inspector', 'command-bar', 'layer-list'],
        layout: 'shell',
        description: 'Creative workspace with central canvas, side tool panel, property inspector, and top toolbar.',
    },
    {
        keywords: ['music', 'audio', 'player', 'spotify', 'podcast'],
        surface: 'immersive',
        requiredModules: ['now-playing', 'playback-controls', 'queue-list', 'browse-grid', 'volume-control'],
        layout: 'stacked',
        description: 'Audio experience with album art, transport controls, queue, browse grid, and persistent player.',
    },
    {
        keywords: ['ecommerce', 'shop', 'store', 'marketplace', 'product'],
        surface: 'marketing',
        requiredModules: ['product-grid', 'search-filter', 'cart-indicator', 'category-nav', 'featured-banner'],
        layout: 'shell',
        description: 'Shopping interface with product grid, filters, cart, category navigation, and featured products.',
    },
    {
        keywords: ['social', 'feed', 'timeline', 'instagram', 'twitter'],
        surface: 'mobile',
        requiredModules: ['content-feed', 'post-composer', 'profile-header', 'engagement-actions', 'story-bar'],
        layout: 'stacked',
        description: 'Social feed with scrollable content, compose action, profile, reactions, and stories/highlights.',
    },
    {
        keywords: ['email', 'mail', 'inbox', 'gmail'],
        surface: 'analytical',
        requiredModules: ['folder-nav', 'message-list', 'message-preview', 'compose-button', 'search-bar'],
        layout: 'split',
        description: 'Email client with folder sidebar, message list, reading pane, compose, and search.',
    },
    {
        keywords: ['calendar', 'schedule', 'planner', 'booking'],
        surface: 'workspace',
        requiredModules: ['calendar-grid', 'event-detail', 'date-navigator', 'sidebar-list', 'create-event'],
        layout: 'shell',
        description: 'Calendar workspace with month/week grid, event cards, date picker, and sidebar agenda.',
    },
    {
        keywords: ['notes', 'notion', 'writing', 'journal', 'wiki', 'docs'],
        surface: 'workspace',
        requiredModules: ['document-editor', 'page-tree', 'toolbar', 'breadcrumb', 'search'],
        layout: 'shell',
        description: 'Writing workspace with rich editor, page navigation tree, formatting toolbar, and search.',
    },
    {
        keywords: ['game', 'gaming', 'rpg', 'strategy', 'simulation'],
        surface: 'immersive',
        requiredModules: ['game-viewport', 'hud-overlay', 'resource-bar', 'action-panel', 'minimap'],
        layout: 'fullscreen-overlay',
        description: 'Game HUD with atmospheric viewport, status overlays, resource indicators, and action controls.',
    },
    {
        keywords: ['video', 'streaming', 'youtube', 'netflix', 'player'],
        surface: 'immersive',
        requiredModules: ['video-player', 'playback-controls', 'content-grid', 'search-browse', 'watch-queue'],
        layout: 'stacked',
        description: 'Video platform with large player, transport controls, recommendation grid, and browse.',
    },
    {
        keywords: ['code', 'ide', 'developer', 'programming', 'terminal'],
        surface: 'workspace',
        requiredModules: ['code-editor', 'file-tree', 'terminal-panel', 'tab-bar', 'status-bar'],
        layout: 'shell',
        description: 'Code editor with syntax-highlighted editor, file explorer, integrated terminal, and tab bar.',
    },
    {
        keywords: ['fitness', 'health', 'workout', 'tracker', 'exercise'],
        surface: 'mobile',
        requiredModules: ['activity-ring', 'stat-cards', 'workout-list', 'progress-chart', 'quick-start'],
        layout: 'stacked',
        description: 'Fitness tracker with activity rings, daily stats, workout history, progress charts, and quick start.',
    },
    {
        keywords: ['finance', 'banking', 'payment', 'wallet', 'crypto', 'trading'],
        surface: 'analytical',
        requiredModules: ['balance-display', 'transaction-list', 'chart-sparkline', 'quick-actions', 'account-nav'],
        layout: 'stacked',
        description: 'Finance interface with balance overview, transaction feed, performance chart, and quick actions.',
    },
    {
        keywords: ['landing', 'marketing', 'startup', 'saas', 'homepage'],
        surface: 'marketing',
        requiredModules: ['hero-section', 'feature-grid', 'social-proof', 'pricing-table', 'cta-section', 'footer'],
        layout: 'stacked',
        description: 'Marketing page with bold hero, feature highlights, testimonials, pricing, CTA, and footer.',
    },
    {
        keywords: ['map', 'navigation', 'location', 'travel', 'delivery'],
        surface: 'immersive',
        requiredModules: ['map-viewport', 'search-location', 'route-panel', 'poi-cards', 'bottom-sheet'],
        layout: 'fullscreen-overlay',
        description: 'Map interface with fullscreen map, location search, route details, and point-of-interest cards.',
    },
    {
        keywords: ['crm', 'sales', 'pipeline', 'contacts', 'leads'],
        surface: 'analytical',
        requiredModules: ['pipeline-board', 'contact-list', 'deal-detail', 'metric-row', 'activity-timeline'],
        layout: 'shell',
        description: 'CRM workspace with deal pipeline, contact list, detail panel, KPIs, and activity log.',
    },
    {
        keywords: ['portfolio', 'personal', 'resume', 'showcase'],
        surface: 'marketing',
        requiredModules: ['hero-identity', 'project-grid', 'about-section', 'skills-list', 'contact-section'],
        layout: 'stacked',
        description: 'Personal portfolio with identity hero, project showcase, about section, skills, and contact.',
    },
]

const SURFACE_DEFAULTS: Record<InterfaceSurface, ProductArchetype> = {
    marketing: {
        keywords: [],
        surface: 'marketing',
        requiredModules: ['hero-section', 'feature-grid', 'cta-section', 'navigation'],
        layout: 'stacked',
        description: 'Marketing page with hero, features, call-to-action, and navigation.',
    },
    analytical: {
        keywords: [],
        surface: 'analytical',
        requiredModules: ['sidebar-nav', 'metric-row', 'chart', 'data-table'],
        layout: 'shell',
        description: 'Data-driven interface with navigation, metrics, visualization, and tables.',
    },
    mobile: {
        keywords: [],
        surface: 'mobile',
        requiredModules: ['top-header', 'content-cards', 'action-list', 'bottom-nav'],
        layout: 'stacked',
        description: 'Mobile-first interface with header, cards, action list, and bottom navigation.',
    },
    immersive: {
        keywords: [],
        surface: 'immersive',
        requiredModules: ['main-viewport', 'hud-controls', 'status-overlay', 'action-panel'],
        layout: 'fullscreen-overlay',
        description: 'Atmospheric interface with full viewport, HUD overlays, and action controls.',
    },
    workspace: {
        keywords: [],
        surface: 'workspace',
        requiredModules: ['canvas-area', 'tool-panel', 'sidebar-nav', 'toolbar'],
        layout: 'shell',
        description: 'Creation-focused workspace with canvas, tools, sidebar, and toolbar.',
    },
}

export function resolveArchetype(intent: IntentJSON): ProductArchetype {
    const haystack = [
        intent.domain,
        intent.productType,
        ...intent.coreTasks,
        intent.primaryUser,
    ].join(' ').toLowerCase()

    let best: ProductArchetype | null = null
    let bestScore = 0

    for (const arch of ARCHETYPES) {
        let score = 0
        for (const kw of arch.keywords) {
            if (haystack.includes(kw)) score++
        }
        if (score > bestScore) {
            bestScore = score
            best = arch
        }
    }

    return best ?? SURFACE_DEFAULTS[intent.surface]
}

export function formatArchetypeForPrompt(archetype: ProductArchetype): string {
    return `PRODUCT ARCHETYPE:
This product is a ${archetype.description}
Layout pattern: ${archetype.layout}

REQUIRED MODULES (the first screen MUST represent ALL of these):
${archetype.requiredModules.map((m, i) => `${i + 1}. ${m}`).join('\n')}

Every module must be visible in the first screen. Do not omit any.
A single isolated control is NEVER acceptable. Build the complete surface.`
}
