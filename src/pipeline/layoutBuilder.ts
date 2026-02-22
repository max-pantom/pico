import type { DesignDecisions, IntentJSON, LayoutNode } from '../types/pipeline'

interface DomainMockData {
    headers: string[]
    rows: string[][]
    kpis: { label: string; value: string }[]
    activity: string[]
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
    if (intent.productType === 'landing') {
        return [
            {
                component: 'HeroSection',
                props: {
                    title: `${intent.domain} for ${intent.primaryUser}`,
                    subtitle: `A ${intent.emotionalTone} experience focused on ${intent.coreTasks.slice(0, 2).join(' and ')}`,
                    ctaLabel: 'Get started',
                    secondaryCtaLabel: 'See how it works',
                },
            },
            {
                component: 'FeatureGrid',
                props: {
                    title: 'What you can do',
                    features: decisions.hierarchyFlow.slice(0, 4),
                },
            },
            {
                component: 'CTASection',
                props: {
                    title: 'Ready to try it?',
                    subtitle: 'Launch a guided setup and invite your team in minutes.',
                    ctaLabel: 'Start now',
                },
            },
            {
                component: 'FooterSection',
                props: {
                    brand: intent.domain,
                    links: decisions.hierarchyFlow.slice(0, 5),
                },
            },
        ]
    }

    const mockData = getMockData(intent.domain)
    const enriched = hydrateDataTables(mainChildren, mockData)

    if (!hasComponent(enriched, 'Header')) {
        enriched.unshift({
            component: 'Header',
            props: {
                title: `${intent.domain} workspace`,
                subtitle: decisions.hierarchyFlow.slice(0, 2).join(' / '),
            },
        })
    }

    const needsMetrics = decisions.layoutStrategy === 'dense-grid' || intent.productType === 'dashboard'
    if (needsMetrics && !hasComponent(enriched, 'KPIRow')) {
        enriched.splice(1, 0, {
            component: 'KPIRow',
            props: { items: mockData.kpis },
        })
    }

    const needsChart = intent.domain.toLowerCase().includes('financ')
        || intent.domain.toLowerCase().includes('analytic')
        || intent.coreTasks.some(task => /trend|analysis|visual/i.test(task))
    if (needsChart && !hasComponent(enriched, 'ChartBlock')) {
        enriched.push({
            component: 'ChartBlock',
            props: {
                type: 'line',
                title: `${decisions.hierarchyFlow[1] || 'Performance'} over time`,
            },
        })
    }

    if (intent.realTimeRequirement && !hasComponent(enriched, 'ActivityFeed')) {
        enriched.push({
            component: 'ActivityFeed',
            props: { title: 'Live Activity', events: mockData.activity },
        })
    }

    if (decisions.layoutStrategy === 'dense-grid' && !hasComponent(enriched, 'MetricCard')) {
        const cards: LayoutNode[] = mockData.kpis.slice(0, 4).map((item, index) => ({
            component: 'MetricCard',
            props: {
                label: item.label,
                value: item.value,
                trend: index % 2 === 0 ? '+6.2%' : '-1.4%',
                trendDirection: index % 2 === 0 ? 'up' : 'down',
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

    if (intent.productType === 'landing' || decisions.layoutStrategy === 'top-nav-content') {
        return {
            component: 'Shell',
            children: [
                {
                    component: 'TopNav',
                    props: {
                        title: intent.domain,
                        links: hierarchy.length > 0 ? hierarchy : ['Home', 'Features', 'Pricing', 'Contact'],
                        ctaLabel: intent.productType === 'landing' ? 'Get started' : 'Start',
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
