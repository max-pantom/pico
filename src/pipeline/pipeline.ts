import { parseIntent } from './intentParser'
import { reasonDesign } from './designReasoner'
import { buildTokens } from './tokenBuilder'
import { generateLayoutVariables } from './layoutGenerator'
import { buildLayout, prepareMainChildren } from './layoutBuilder'
import { generateAppState } from './stateGenerator'
import { exportReactCode } from './codeExporter'
import { runQualityGate } from './qualityGate'
import type { PipelineOutput, PipelineStage } from '../types/pipeline'

const MAX_RETRIES = 2

export async function runPipeline(
    prompt: string,
    onStageChange?: (stage: PipelineStage, detail?: string) => void
): Promise<PipelineOutput> {
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

    // Quality gate with retry
    let attempts = 0
    while (!qualityResult.passed && attempts < MAX_RETRIES) {
        const critique = qualityResult.issues.join('\n')
        notify(
            'reasoning',
            `Quality score ${qualityResult.score} needs improvement; retrying decisions (${attempts + 1}/${MAX_RETRIES})`
        )
        decisions = await reasonDesign(intent, critique)

        notify('building', `Rebuilding layout dynamically after retry ${attempts + 1}`)
        mainChildren = await generateLayoutVariables(intent, decisions)
        mainChildren = prepareMainChildren(intent, decisions, mainChildren)
        tokens = buildTokens(decisions)
        layout = buildLayout(intent, decisions, mainChildren)
        qualityResult = runQualityGate(layout, tokens, decisions)
        attempts++
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
    }
}
