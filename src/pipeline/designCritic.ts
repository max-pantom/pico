/**
 * Design Critic Engine
 *
 * Pico's design intelligence layer. Acts like a senior product designer
 * reviewing an interface. Evaluates UI against design laws and outputs
 * structured critique to feed back into the generation loop.
 *
 * Design quality emerges from correction, not first drafts.
 */

import type {
    DesignCriticOutput,
    DesignCriticIssue,
    IntentJSON,
    DesignDecisions,
    LayoutNode,
    ResolvedTokens,
} from '../types/pipeline'
import { callLLM, extractJSON } from '../lib/llm'

const CRITIC_SYSTEM_PROMPT = `You are a senior product designer reviewing an AI-generated interface.

Your job is to EVALUATE the UI like a design director would. You are NOT generating code or layouts.
You are identifying what is wrong, what is missing, and what should change.

Evaluate against these DESIGN LAWS:

1. HIERARCHY LAWS
   - Every screen must have one dominant action or focal element
   - Visual weight must map to importance
   - Largest element = most important function
   - Primary action unclear = critical flaw

2. COMPOSITION LAWS
   - Avoid center-stack default (generic AI output)
   - Use edge anchoring where appropriate
   - Respect reading flow (F-pattern, Z-pattern)
   - Maintain negative space balance

3. RHYTHM LAWS
   - Spacing must follow a scale: 4, 8, 12, 16, 24, 32, 48, 64
   - Never random spacing values
   - Section gaps should be consistent

4. INTERACTION LAWS
   - Mobile: thumb zones matter; primary controls reachable
   - Minimum touch size 44px for interactive elements
   - Primary controls should be obvious

5. ACCESSIBILITY LAWS (CRITICAL)
   - Text contrast ≥ WCAG AA
   - Readable font sizes (body ≥ 14px)
   - Accessible hit areas
   - Semantic grouping for screen readers

6. PRODUCT ARCHETYPE LAWS
   - Camera ≠ Dashboard ≠ Landing page
   - Each has structural expectations
   - Dashboard: scannable grid, summary first, filters visible
   - Landing: hero, value prop, features, CTA
   - Tool: workspace focus, minimal chrome

RETURN ONLY valid JSON. No explanation, no markdown fences.

OUTPUT SCHEMA:
{
  "screenType": "string - what kind of screen is this (dashboard, landing, tool, etc.)",
  "primaryGoal": "string - what is the screen trying to accomplish",
  "issues": [
    {
      "type": "hierarchy|composition|accessibility|interaction|rhythm|product-appropriateness|contrast|layout-intent",
      "problem": "string - specific problem",
      "severity": "critical|high|medium|low",
      "suggestion": "string - optional fix"
    }
  ],
  "criticalFlaws": ["string - must-fix items"],
  "missingElements": ["string - what should exist but doesn't"],
  "layoutCorrections": ["string - structural changes needed"],
  "priorityFixes": ["string - ordered list of fixes to apply first"],
  "passed": false
}

Set "passed" to true only if there are no critical or high severity issues.
Be strict. Generic AI output typically fails hierarchy and composition.`

function layoutToSummary(layout: LayoutNode, depth = 0): string {
    const indent = '  '.repeat(depth)
    const childrenSummary =
        layout.children && layout.children.length > 0
            ? layout.children.map(c => layoutToSummary(c, depth + 1)).join('\n')
            : ''
    const propsStr = layout.props ? ` ${JSON.stringify(layout.props)}` : ''
    return `${indent}${layout.component}${propsStr}${childrenSummary ? '\n' + childrenSummary : ''}`
}

export async function runDesignCritic(
    intent: IntentJSON,
    decisions: DesignDecisions,
    layout: LayoutNode,
    mainChildren: LayoutNode[],
    tokens: ResolvedTokens
): Promise<DesignCriticOutput> {
    const layoutSummary = layoutToSummary(layout)
    const mainSummary = mainChildren.map(c => layoutToSummary(c)).join('\n')

    const userContent = `INTENT:
${JSON.stringify(intent, null, 2)}

DESIGN DECISIONS (layoutStrategy, visualTone, density, etc.):
${JSON.stringify(
    {
        layoutStrategy: decisions.layoutStrategy,
        navigationPosition: decisions.navigationPosition,
        density: decisions.density,
        visualTone: decisions.visualTone,
        typographyStrategy: decisions.typographyStrategy,
        contentArchitecture: decisions.contentArchitecture,
        hierarchyFlow: decisions.hierarchyFlow,
    },
    null,
    2
)}

LAYOUT STRUCTURE:
${layoutSummary}

MAIN CONTENT STRUCTURE:
${mainSummary}

SPACING TOKENS (check rhythm):
${JSON.stringify(tokens.runtime?.spacing ?? {}, null, 2)}

COLOR TOKENS (check contrast):
${JSON.stringify(
    {
        text: tokens.runtime?.colors?.text,
        background: tokens.runtime?.colors?.background,
        primary: tokens.runtime?.colors?.primary,
        muted: tokens.runtime?.colors?.muted,
    },
    null,
    2
)}

Evaluate this UI. Return ONLY valid JSON.`

    const text = await callLLM(CRITIC_SYSTEM_PROMPT, userContent)
    const cleanJson = extractJSON(text)

    try {
        const parsed = JSON.parse(cleanJson) as Partial<DesignCriticOutput>

        const issues: DesignCriticIssue[] = Array.isArray(parsed.issues)
            ? parsed.issues
                  .filter(
                      (i): i is DesignCriticIssue =>
                          i &&
                          typeof i === 'object' &&
                          typeof i.problem === 'string' &&
                          typeof i.severity === 'string'
                  )
                  .map(i => ({
                      type: i.type ?? 'hierarchy',
                      problem: i.problem,
                      severity: i.severity,
                      suggestion: i.suggestion,
                  }))
            : []

        const criticalFlaws = Array.isArray(parsed.criticalFlaws)
            ? parsed.criticalFlaws.map(String)
            : []
        const missingElements = Array.isArray(parsed.missingElements)
            ? parsed.missingElements.map(String)
            : []
        const layoutCorrections = Array.isArray(parsed.layoutCorrections)
            ? parsed.layoutCorrections.map(String)
            : []
        const priorityFixes = Array.isArray(parsed.priorityFixes)
            ? parsed.priorityFixes.map(String)
            : []

        const hasCriticalOrHigh = issues.some(
            i => i.severity === 'critical' || i.severity === 'high'
        )
        const passed = parsed.passed === true && !hasCriticalOrHigh

        return {
            screenType: String(parsed.screenType ?? intent.productType),
            primaryGoal: String(parsed.primaryGoal ?? intent.coreTasks?.[0] ?? 'unknown'),
            issues,
            criticalFlaws,
            missingElements,
            layoutCorrections,
            priorityFixes,
            passed,
        }
    } catch {
        throw new Error(`Design critic returned invalid JSON: ${text}`)
    }
}

/** Build a critique string to feed into design reasoner retry */
export function criticToRetryPrompt(critic: DesignCriticOutput): string {
    const parts: string[] = []

    if (critic.criticalFlaws.length > 0) {
        parts.push('Critical flaws: ' + critic.criticalFlaws.join('; '))
    }
    if (critic.issues.length > 0) {
        const high = critic.issues.filter(i => i.severity === 'critical' || i.severity === 'high')
        if (high.length > 0) {
            parts.push('Design issues: ' + high.map(i => i.problem).join('; '))
        }
    }
    if (critic.missingElements.length > 0) {
        parts.push('Missing: ' + critic.missingElements.join(', '))
    }
    if (critic.layoutCorrections.length > 0) {
        parts.push('Layout corrections: ' + critic.layoutCorrections.join('; '))
    }
    if (critic.priorityFixes.length > 0) {
        parts.push('Priority fixes: ' + critic.priorityFixes.join('; '))
    }

    return parts.join('\n')
}
