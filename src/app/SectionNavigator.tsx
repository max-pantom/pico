import type { LayoutNode } from '../types/pipeline'

const SECTION_LABELS: Record<string, string> = {
    HeroSection: 'Hero',
    FeatureGrid: 'Features',
    CTASection: 'CTA',
    FooterSection: 'Footer',
    WorkGrid: 'Work',
}

function collectSections(node: LayoutNode): string[] {
    const sections: string[] = []
    if (SECTION_LABELS[node.component]) {
        sections.push(node.component)
    }
    node.children?.forEach((child) => {
        sections.push(...collectSections(child))
    })
    return sections
}

export function SectionNavigator({ layout }: { layout: LayoutNode }) {
    const sections = collectSections(layout)

    if (sections.length === 0) return null

    const handleClick = (component: string) => {
        const id = `section-${component.toLowerCase()}`
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <nav className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
            {sections.map((component) => (
                <button
                    key={component}
                    onClick={() => handleClick(component)}
                    className="text-[11px] text-gray-500 hover:text-white transition-colors text-right px-2 py-1 rounded hover:bg-gray-800/50"
                >
                    {SECTION_LABELS[component]}
                </button>
            ))}
        </nav>
    )
}
