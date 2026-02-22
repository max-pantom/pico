import type { DesignDecisions, IntentJSON, LayoutNode, RuntimeMockData } from '../types/pipeline'

interface DomainMockData {
    headers: string[]
    rows: string[][]
    kpis: { label: string; value: string }[]
    activity: string[]
}

const defaultContentArchitecture: Record<IntentJSON['productType'], string[]> = {
    dashboard: ['overview', 'metrics', 'activity', 'detail'],
    landing: ['hero', 'value-prop', 'features', 'social-proof', 'pricing', 'cta'],
    onboarding: ['intro', 'step-form', 'progress', 'completion'],
    settings: ['profile', 'preferences', 'integrations', 'security'],
    admin: ['navigation', 'filters', 'table', 'detail-panel'],
    feed: ['composer', 'feed-list', 'engagement'],
    ecommerce: ['search-filter', 'product-grid', 'product-detail', 'cart'],
    documentation: ['search', 'sidebar-navigation', 'prose-content', 'code-examples'],
    portal: ['navigation', 'overview', 'workflows', 'support'],
    'mobile-app': ['top-summary', 'cards', 'bottom-actions'],
    form: ['header', 'form-fields', 'submit'],
    tool: ['workspace', 'actions', 'results'],
    portfolio: ['hero-identity', 'selected-work', 'about-process', 'contact'],
}

const forbiddenByProductType: Partial<Record<IntentJSON['productType'], string[]>> = {
    portfolio: ['DataTable', 'StatBlock', 'ActivityFeed', 'KPIRow', 'ChartBlock', 'MetricCard'],
    landing: ['DataTable', 'StatBlock', 'ActivityFeed', 'KPIRow', 'ChartBlock', 'MetricCard'],
    documentation: ['StatBlock', 'ActivityFeed', 'KPIRow', 'ChartBlock', 'MetricCard', 'HeroSection'],
    ecommerce: ['StatBlock', 'ActivityFeed', 'KPIRow', 'ChartBlock', 'MetricCard'],
    feed: ['DataTable', 'ChartBlock', 'KPIRow'],
}

const mockDataByDomain: Record<string, DomainMockData> = {
    finance: {
        headers: ['Date', 'Revenue', 'Expenses', 'Net', 'Delta'],
        rows: [
            ['Jan 12', '$48,200', '$31,400', '$16,800', '+4.2%'],
            ['Jan 13', '$52,100', '$29,800', '$22,300', '+8.1%'],
            ['Jan 14', '$39,400', '$33,100', '$6,300', '-2.4%'],
        ],
        kpis: [
            { label: 'ARR', value: '$3.2M' },
            { label: 'Runway', value: '18 mo' },
            { label: 'Burn', value: '$124k' },
            { label: 'Margin', value: '42%' },
        ],
        activity: [
            'Settlement completed - Portfolio A|2 min ago',
            'Risk threshold warning - EUR desk|9 min ago',
            'Payout batch executed - Q1 bonuses|16 min ago',
        ],
    },
    healthcare: {
        headers: ['Patient', 'Ward', 'Status', 'Wait', 'Priority'],
        rows: [
            ['Chen, L.', 'Ward 3', 'Active', '12m', 'High'],
            ['Okafor, M.', 'Ward 1', 'Pending', '28m', 'Medium'],
            ['Reyes, C.', 'ICU', 'Critical', '--', 'Urgent'],
        ],
        kpis: [
            { label: 'Patients', value: '142' },
            { label: 'Avg Wait', value: '18m' },
            { label: 'Critical', value: '9' },
            { label: 'Discharges', value: '27' },
        ],
        activity: [
            'Patient admitted - Ward 3|2 min ago',
            'Lab results ready - J. Doe|8 min ago',
            'Medication dispensed - Room 12|15 min ago',
        ],
    },
    saas: {
        headers: ['Account', 'MRR', 'Plan', 'Health', 'Last Active'],
        rows: [
            ['Acme Corp', '$4,200', 'Enterprise', '92', '2h ago'],
            ['Notion Inc', '$890', 'Pro', '78', '1d ago'],
            ['Stripe', '$12,400', 'Enterprise', '98', '5m ago'],
        ],
        kpis: [
            { label: 'MRR', value: '$86.4k' },
            { label: 'Expansion', value: '12.2%' },
            { label: 'Churn', value: '1.1%' },
            { label: 'NPS', value: '54' },
        ],
        activity: [
            'Upgrade completed - Acme Corp|5 min ago',
            'New trial started - Rivet Labs|12 min ago',
            'Usage spike detected - Segment Team|21 min ago',
        ],
    },
}

function getMockData(domain: string): DomainMockData {
    const normalized = domain.toLowerCase()
    if (normalized.includes('health')) return mockDataByDomain.healthcare
    if (normalized.includes('financ') || normalized.includes('bank') || normalized.includes('invest')) return mockDataByDomain.finance
    return mockDataByDomain.saas
}

function resolveContentArchitecture(intent: IntentJSON, decisions: DesignDecisions): string[] {
    if (Array.isArray(decisions.contentArchitecture) && decisions.contentArchitecture.length > 0) {
        return decisions.contentArchitecture.map(section => String(section).toLowerCase())
    }

    return defaultContentArchitecture[intent.productType] || defaultContentArchitecture.dashboard
}

function filterForbiddenComponents(nodes: LayoutNode[], productType: IntentJSON['productType']): LayoutNode[] {
    const forbidden = new Set(forbiddenByProductType[productType] || [])
    if (forbidden.size === 0) return nodes

    return nodes
        .filter(node => !forbidden.has(node.component))
        .map(node => ({
            ...node,
            children: node.children ? filterForbiddenComponents(node.children, productType) : node.children,
        }))
}

function dropTopLevelComponents(nodes: LayoutNode[], names: string[]): LayoutNode[] {
    const blocked = new Set(names)
    return nodes.filter(node => !blocked.has(node.component))
}

function normalizeRuntimeMockData(mockData?: RuntimeMockData): DomainMockData | null {
    if (!mockData) return null

    const table = mockData.table
    const stats = Array.isArray(mockData.stats) ? mockData.stats : []
    const activity = Array.isArray(mockData.activity) ? mockData.activity : []

    if (!table && stats.length === 0 && activity.length === 0) return null

    return {
        headers: Array.isArray(table?.columns) ? table.columns : ['Column 1', 'Column 2', 'Column 3'],
        rows: Array.isArray(table?.rows) ? table.rows : [],
        kpis: stats.map((item) => ({ label: item.label, value: item.value })),
        activity,
    }
}

function toLayoutNodeArray(value: unknown): LayoutNode[] {
    if (!Array.isArray(value)) return []

    const normalized: LayoutNode[] = []
    for (const entry of value) {
        if (!entry || typeof entry !== 'object') continue

        const candidate = entry as { component?: unknown; props?: unknown; children?: unknown }
        if (typeof candidate.component !== 'string') continue

        const props = candidate.props && typeof candidate.props === 'object'
            ? candidate.props as Record<string, unknown>
            : undefined

        normalized.push({
            component: candidate.component as LayoutNode['component'],
            props,
            children: toLayoutNodeArray(candidate.children),
        })
    }

    return normalized
}

function hasComponent(nodes: unknown, name: string): boolean {
    const safeNodes = toLayoutNodeArray(nodes)
    return safeNodes.some(node => node.component === name || hasComponent(node.children, name))
}

function hydrateDataTables(nodes: unknown, mockData: DomainMockData): LayoutNode[] {
    const safeNodes = toLayoutNodeArray(nodes)
    return safeNodes.map(node => {
        const nextNode: LayoutNode = {
            ...node,
            props: { ...node.props },
            children: hydrateDataTables(node.children, mockData),
        }

        if (nextNode.component === 'DataTable') {
            if (!Array.isArray(nextNode.props?.columns)) {
                nextNode.props = { ...nextNode.props, columns: mockData.headers }
            }
            if (!Array.isArray(nextNode.props?.rows)) {
                nextNode.props = { ...nextNode.props, rows: mockData.rows }
            }
        }

        return nextNode
    })
}

export function prepareMainChildren(intent: IntentJSON, decisions: DesignDecisions, mainChildren: LayoutNode[]): LayoutNode[] {
    const contentArchitecture = resolveContentArchitecture(intent, decisions)

    if (intent.productType === 'landing') {
        return [
            ...(contentArchitecture.some(section => section.includes('hero'))
                ? [{
                    component: 'HeroSection' as const,
                    props: {
                        title: `${intent.domain} for ${intent.primaryUser}`,
                        subtitle: `A ${intent.emotionalTone} experience focused on ${intent.coreTasks.slice(0, 2).join(' and ')}`,
                        ctaLabel: 'Get started',
                        secondaryCtaLabel: 'See how it works',
                    },
                }]
                : []),
            ...(contentArchitecture.some(section => section.includes('feature') || section.includes('value'))
                ? [{
                    component: 'FeatureGrid' as const,
                    props: {
                        title: 'What you can do',
                        features: decisions.hierarchyFlow.slice(0, 4),
                    },
                }]
                : []),
            ...(contentArchitecture.some(section => section.includes('cta') || section.includes('pricing'))
                ? [{
                    component: 'CTASection' as const,
                    props: {
                        title: 'Ready to try it?',
                        subtitle: 'Launch a guided setup and invite your team in minutes.',
                        ctaLabel: 'Start now',
                    },
                }]
                : []),
            {
                component: 'FooterSection',
                props: {
                    brand: intent.domain,
                    links: decisions.hierarchyFlow.slice(0, 5),
                },
            },
        ]
    }

    if (intent.productType === 'portfolio') {
        return [
            {
                component: 'HeroSection',
                props: {
                    title: `${intent.primaryUser} portfolio`,
                    subtitle: intent.emotionalTone,
                    ctaLabel: 'View work',
                    secondaryCtaLabel: 'Contact',
                },
            },
            {
                component: 'WorkGrid',
                props: {
                    title: 'Selected work',
                    projects: decisions.hierarchyFlow.slice(0, 6),
                },
            },
            {
                component: 'FeatureGrid',
                props: {
                    title: 'About and process',
                    features: decisions.hierarchyFlow.slice(0, 4),
                },
            },
            {
                component: 'CTASection',
                props: {
                    title: 'Let\'s build together',
                    subtitle: 'Open to collaborations and commissions.',
                    ctaLabel: 'Get in touch',
                },
            },
        ]
    }

    const mockData = normalizeRuntimeMockData(decisions.mockData) || getMockData(intent.domain)
    let enriched = filterForbiddenComponents(hydrateDataTables(mainChildren, mockData), intent.productType)

    if (!hasComponent(enriched, 'Header')) {
        enriched.unshift({
            component: 'Header',
            props: {
                title: `${intent.domain} workspace`,
                subtitle: decisions.hierarchyFlow.slice(0, 2).join(' / '),
            },
        })
    }

    const canUseDashboardBlocks = intent.productType === 'dashboard' || intent.productType === 'admin' || intent.productType === 'tool'

    if (decisions.layoutStrategy === 'dense-grid') {
        const hasMetricCards = hasComponent(enriched, 'MetricCard')
        const hasKpiRow = hasComponent(enriched, 'KPIRow')

        if (hasMetricCards) {
            enriched = dropTopLevelComponents(enriched, ['KPIRow', 'StatBlock'])
        } else if (hasKpiRow) {
            enriched = dropTopLevelComponents(enriched, ['StatBlock'])
        }
    }

    const needsKpiRow = canUseDashboardBlocks
        && decisions.layoutStrategy !== 'dense-grid'
        && !hasComponent(enriched, 'KPIRow')
    if (needsKpiRow) {
        enriched.splice(1, 0, {
            component: 'KPIRow',
            props: { items: mockData.kpis },
        })
    }

    const needsChart = canUseDashboardBlocks && (intent.domain.toLowerCase().includes('financ')
        || intent.domain.toLowerCase().includes('analytic')
        || intent.coreTasks.some(task => /trend|analysis|visual/i.test(task)))
    if (needsChart && !hasComponent(enriched, 'ChartBlock')) {
        enriched.push({
            component: 'ChartBlock',
            props: {
                type: 'line',
                title: `${decisions.hierarchyFlow[1] || 'Performance'} over time`,
            },
        })
    }

    if (canUseDashboardBlocks && intent.realTimeRequirement && !hasComponent(enriched, 'ActivityFeed')) {
        enriched.push({
            component: 'ActivityFeed',
            props: { title: 'Live Activity', events: mockData.activity },
        })
    }

    const hasAnyMetrics = hasComponent(enriched, 'MetricCard') || hasComponent(enriched, 'KPIRow') || hasComponent(enriched, 'StatBlock')
    if (canUseDashboardBlocks && decisions.layoutStrategy === 'dense-grid' && !hasAnyMetrics) {
        const sourceStats = Array.isArray(decisions.mockData?.stats) && decisions.mockData.stats.length > 0
            ? decisions.mockData.stats
            : mockData.kpis.slice(0, 4).map((item, index) => ({
                label: item.label,
                value: item.value,
                trend: index % 2 === 0 ? '+6.2%' : '-1.4%',
                trendDirection: index % 2 === 0 ? 'up' as const : 'down' as const,
            }))

        const cards: LayoutNode[] = sourceStats.slice(0, 4).map((item, index) => ({
            component: 'MetricCard',
            props: {
                label: item.label,
                value: item.value,
                trend: item.trend || (index % 2 === 0 ? '+6.2%' : '-1.4%'),
                trendDirection: item.trendDirection || (index % 2 === 0 ? 'up' : 'down'),
            },
        }))
        enriched.splice(2, 0, ...cards)
    }

    return enriched
}

export function buildLayout(intent: IntentJSON, decisions: DesignDecisions, mainChildren: LayoutNode[]): LayoutNode {
    const enrichedChildren = mainChildren
    const hierarchy = Array.isArray(decisions.hierarchyFlow) ? decisions.hierarchyFlow : []
    const navItems: LayoutNode[] = hierarchy.map((item, i) => ({
        component: 'NavItem',
        props: { label: item, active: i === 0 },
    }))

    if (decisions.layoutStrategy === 'canvas') {
        return {
            component: 'Shell',
            children: [
                {
                    component: 'MainContent',
                    children: enrichedChildren,
                },
            ],
        }
    }

    if (intent.productType === 'landing' || intent.productType === 'portfolio' || decisions.layoutStrategy === 'top-nav-content') {
        return {
            component: 'Shell',
            children: [
                {
                    component: 'TopNav',
                    props: {
                        title: intent.domain,
                        links: hierarchy.length > 0 ? hierarchy : ['Home', 'Features', 'Pricing', 'Contact'],
                        ctaLabel: intent.productType === 'landing' ? 'Get started' : intent.productType === 'portfolio' ? 'Contact' : 'Start',
                    },
                },
                {
                    component: 'PageContent',
                    children: enrichedChildren,
                },
            ],
        }
    }

    if (decisions.layoutStrategy === 'split-panel') {
        return {
            component: 'Shell',
            children: [
                {
                    component: 'ListPanel',
                    props: { title: 'Navigation' },
                    children: navItems,
                },
                {
                    component: 'DetailPanel',
                    children: enrichedChildren,
                },
            ],
        }
    }

    if (decisions.layoutStrategy === 'dense-grid') {
        return {
            component: 'Shell',
            children: [
                {
                    component: 'DenseGrid',
                    children: enrichedChildren,
                },
            ],
        }
    }

    return {
        component: 'Shell',
        children: [
            {
                component: 'Sidebar',
                children: navItems,
            },
            {
                component: 'MainContent',
                children: enrichedChildren,
            },
        ],
    }
}
