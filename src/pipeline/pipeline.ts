import { parseIntent } from './intentParser'
import { reasonDesign } from '../legacy-generation/pipeline/designReasoner'
import { buildTokens } from '../legacy-generation/pipeline/tokenBuilder'
import { generateLayoutVariables } from '../legacy-generation/pipeline/layoutGenerator'
import { buildLayout, prepareMainChildren } from '../legacy-generation/pipeline/layoutBuilder'
import { generateAppState } from '../legacy-generation/pipeline/stateGenerator'
import { exportReactCode } from '../legacy-generation/pipeline/codeExporter'
import { runQualityGate } from './qualityGate'
import { runDesignCritic, criticToRetryPrompt } from './designCritic'
import type { PipelineOutput, PipelineStage } from '../types/pipeline'

const MAX_RETRIES = 2

export interface PipelineOptions {
    /** When false, skip design critic — produces raw first-pass output */
    useDesignCritic?: boolean
}

export async function runPipeline(
    prompt: string,
    onStageChange?: (stage: PipelineStage, detail?: string) => void,
    options: PipelineOptions = {}
): Promise<PipelineOutput> {
    const { useDesignCritic = true } = options
    const notify = (stage: PipelineStage, detail?: string) => onStageChange?.(stage, detail)

    // Layer 1: Intent
    notify('parsing', 'Parsing prompt into structured intent')
    const intent = await parseIntent(prompt)

    // Layer 2: Design Reasoning
    notify('reasoning', 'Inferring design decisions from parsed intent')
    let decisions = await reasonDesign(intent)

    // Layer 3: Build & Layout Generation
    notify('building', 'Building layout structure dynamically')
    let mainChildren = await generateLayoutVariables(intent, decisions)
    mainChildren = prepareMainChildren(intent, decisions, mainChildren)
    let tokens = buildTokens(decisions)
    let layout = buildLayout(intent, decisions, mainChildren)
    let qualityResult = runQualityGate(layout, tokens, decisions)

    // Quality gate + Design critic retry loop (skipped when useDesignCritic is false)
    let attempts = 0
    let criticOutput: Awaited<ReturnType<typeof runDesignCritic>> | undefined

    if (useDesignCritic) {
        while (attempts < MAX_RETRIES) {
            const qualityPassed = qualityResult.passed

            notify('critiquing', 'Design critic evaluating hierarchy, composition, accessibility')
            criticOutput = await runDesignCritic(intent, decisions, layout, mainChildren, tokens)
            const criticPassed = criticOutput.passed

            if (qualityPassed && criticPassed) break

            const critiqueParts: string[] = []
            if (!qualityPassed) {
                critiqueParts.push(`Quality gate: ${qualityResult.issues.join('; ')}`)
            }
            if (!criticPassed) {
                critiqueParts.push(criticToRetryPrompt(criticOutput))
            }
            const critique = critiqueParts.join('\n\n')

            notify(
                'reasoning',
                `Design critic found issues; retrying decisions (${attempts + 1}/${MAX_RETRIES})`
            )
            decisions = await reasonDesign(intent, critique)

            notify('building', `Rebuilding layout after design corrections`)
            mainChildren = await generateLayoutVariables(intent, decisions)
            mainChildren = prepareMainChildren(intent, decisions, mainChildren)
            tokens = buildTokens(decisions)
            layout = buildLayout(intent, decisions, mainChildren)
            qualityResult = runQualityGate(layout, tokens, decisions)
            attempts++
        }
    } else {
        // Raw mode: quality gate retry only (no critic)
        while (!qualityResult.passed && attempts < MAX_RETRIES) {
            const critique = qualityResult.issues.join('\n')
            notify('reasoning', `Quality gate retry (${attempts + 1}/${MAX_RETRIES})`)
            decisions = await reasonDesign(intent, critique)
            notify('building', `Rebuilding layout`)
            mainChildren = await generateLayoutVariables(intent, decisions)
            mainChildren = prepareMainChildren(intent, decisions, mainChildren)
            tokens = buildTokens(decisions)
            layout = buildLayout(intent, decisions, mainChildren)
            qualityResult = runQualityGate(layout, tokens, decisions)
            attempts++
        }
    }

    notify('rendering', `Synthesizing functional components...`)

    // Layer 4: State & Code Generation
    let appState
    try {
        appState = await generateAppState(intent, decisions, mainChildren)
    } catch (e) {
        console.warn('Failed to generate state, proceeding without functional hooks', e)
    }

    notify('rendering', `Exporting React source code`)
    const reactSourceCode = exportReactCode(
        // We export the entire layout (which includes Shell, Sidebar, Header)
        // but state was inferred mostly from mainChildren
        [layout],
        tokens,
        appState
    )

    return {
        intent,
        decisions,
        tokens,
        mainChildren,
        layout,
        appState,
        reactSourceCode,
        qualityScore: qualityResult.score,
        qualityIssues: qualityResult.issues,
        criticOutput,
    }
}
