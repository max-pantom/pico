import type { LayoutNode } from '../../types/pipeline'
import type { DesignDocument } from './frameModel'

/**
 * Translates a DesignDocument (frame + layers) into a LayoutNode (component tree).
 * Components are derived from layers, not the source of truth.
 */
export function designDocumentToLayoutNode(doc: DesignDocument): LayoutNode {
    const { frame } = doc
    const layers = frame.layers

    const headline = layers.find(l => l.role === 'headline' && l.content)
    const supportingText = layers.find(l => l.role === 'supporting-text' && l.content)
    const control = layers.find(l => l.role === 'control')
    const navLayers = layers.filter(l => l.role === 'navigation')

    const headlineText = headline?.content ?? doc.name
    const subheadlineText = supportingText?.content ?? ''
    const ctaLabel = control?.content ?? 'Get Started'

    if (navLayers.length > 0) {
        return {
            component: 'Shell',
            children: [
                {
                    component: 'Sidebar',
                    children: navLayers.slice(0, 6).map((l, i) => ({
                        component: 'NavItem' as const,
                        props: { label: l.content ?? `Nav ${i + 1}`, active: i === 0 },
                    })),
                },
                {
                    component: 'MainContent',
                    children: [
                        {
                            component: 'HeroSection',
                            props: {
                                headline: headlineText,
                                subheadline: subheadlineText,
                                ctaPrimary: ctaLabel,
                                ctaSecondary: null,
                                backgroundTreatment: 'gradient',
                                layout: 'left-aligned',
                            },
                        },
                    ],
                },
            ],
        }
    }

    return {
        component: 'Shell',
        children: [
            {
                component: 'TopNav',
                props: {
                    title: doc.name,
                    links: [],
                    ctaLabel,
                },
            },
            {
                component: 'MainContent',
                children: [
                    {
                        component: 'HeroSection',
                        props: {
                            headline: headlineText,
                            subheadline: subheadlineText,
                            ctaPrimary: ctaLabel,
                            ctaSecondary: null,
                            backgroundTreatment: 'gradient',
                            layout: 'left-aligned',
                        },
                    },
                ],
            },
        ],
    }
}
