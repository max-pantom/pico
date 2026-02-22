import { callLLM, extractJSON } from '../lib/llm'
import type { IntentJSON, LayoutNode } from '../types/pipeline'
import type { Exploration } from './explorationEngine'

const EXPANSION_SYSTEM_PROMPT = `You are Pico in execution mode.
Expand the chosen direction into a complete product page.

Rules:
- Preserve the chosen visual DNA.
- Keep section hierarchy coherent and product-type appropriate.
- Return ONLY valid JSON layout tree.

Allowed components:
Header, HeroSection, WorkGrid, FeatureGrid, CTASection, FooterSection,
Card, MetricCard, KPIRow, DataTable, ActivityFeed, Tabs, Button, Badge, Divider`

function asLayoutTree(raw: string): LayoutNode {
    const parsed = JSON.parse(extractJSON(raw)) as unknown

    if (Array.isArray(parsed)) {
        return {
            component: 'MainContent',
            children: parsed as LayoutNode[],
        }
    }

    if (parsed && typeof parsed === 'object' && 'component' in parsed) {
        return parsed as LayoutNode
    }

    return {
        component: 'MainContent',
        children: [],
    }
}

function fallbackExpandedLayout(exploration: Exploration, intent: IntentJSON): LayoutNode {
    return {
        component: 'MainContent',
        children: [
            exploration.heroLayout,
            {
                component: 'FeatureGrid',
                props: {
                    title: 'Product structure',
                    features: intent.coreTasks,
                },
            },
            {
                component: 'CTASection',
                props: {
                    title: 'Take the next step',
                    subtitle: exploration.philosophy,
                    ctaLabel: 'Continue',
                },
            },
            {
                component: 'FooterSection',
                props: {
                    brand: intent.domain,
                    links: ['About', 'Contact', 'Privacy'],
                },
            },
        ],
    }
}

export async function expandExploration(exploration: Exploration, intent: IntentJSON): Promise<LayoutNode> {
    const userMessage = `Chosen direction:\nTitle: ${exploration.title}\nPhilosophy: ${exploration.philosophy}\nCreative seed: ${exploration.seed.directive}\n\nHero reference:\n${JSON.stringify(exploration.heroLayout, null, 2)}\n\nProduct intent:\n${JSON.stringify(intent, null, 2)}\n\nReturn full page layout JSON.`

    const firstRaw = await callLLM(EXPANSION_SYSTEM_PROMPT, userMessage)
    try {
        return asLayoutTree(firstRaw)
    } catch {
        const retryRaw = await callLLM(EXPANSION_SYSTEM_PROMPT, `Your previous output was invalid JSON. Return only valid JSON.\n\n${userMessage}`)
        try {
            return asLayoutTree(retryRaw)
        } catch {
            return fallbackExpandedLayout(exploration, intent)
        }
    }
}
