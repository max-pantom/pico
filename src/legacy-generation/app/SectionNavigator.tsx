import type { InterfaceSurface, LayoutNode } from '../../types/pipeline'
import { usePicoStore } from '../../store/picoStore'

const SECTION_LABELS: Record<string, string> = {
    HeroSection: 'Hero',
    FeatureGrid: 'Features',
    CTASection: 'CTA',
    FooterSection: 'Footer',
    WorkGrid: 'Work',
    KPIRow: 'KPIs',
    ChartBlock: 'Chart',
    DataTable: 'Data',
    ActivityFeed: 'Activity',
    Header: 'Header',
    Card: 'Card',
    Tabs: 'Tabs',
}

const SURFACE_SECTION_COMPONENTS: Record<InterfaceSurface, Set<string>> = {
    marketing: new Set(['HeroSection', 'FeatureGrid', 'CTASection', 'FooterSection', 'WorkGrid']),
    analytical: new Set(['Header', 'KPIRow', 'ChartBlock', 'DataTable', 'ActivityFeed']),
    mobile: new Set(['Card']),
    workspace: new Set(['Header', 'Tabs', 'Card', 'ChartBlock', 'ActivityFeed']),
    immersive: new Set(['HeroSection', 'KPIRow', 'WorkGrid']),
}

function collectSections(node: LayoutNode, allowedSet: Set<string>, depth = 0): string[] {
    const sections: string[] = []
    if (depth <= 2 && allowedSet.has(node.component)) {
        sections.push(node.component)
    }
    node.children?.forEach((child) => {
        sections.push(...collectSections(child, allowedSet, depth + 1))
    })
    return sections
}

function dedupeLabels(sections: string[]): Array<{ id: string; label: string }> {
    const counts = new Map<string, number>()
    return sections.map((component) => {
        const count = (counts.get(component) ?? 0) + 1
        counts.set(component, count)
        const base = SECTION_LABELS[component] ?? component
        const label = count > 1 ? `${base} ${count}` : base
        const id = `section-${component.toLowerCase()}-${count}`
        return { id, label }
    })
}

export function SectionNavigator({ layout }: { layout: LayoutNode }) {
    const { intent } = usePicoStore()
    const surface = intent?.surface ?? 'marketing'

    if (surface === 'mobile') return null

    const allowedSet = SURFACE_SECTION_COMPONENTS[surface]
    const sections = collectSections(layout, allowedSet)

    if (sections.length === 0) return null

    const items = dedupeLabels(sections)

    const handleClick = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <nav className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => handleClick(item.id)}
                    className="text-[11px] text-neutral-500 hover:text-neutral-100 transition-colors text-right px-2 py-1 rounded hover:bg-neutral-800/50"
                >
                    {item.label}
                </button>
            ))}
        </nav>
    )
}
