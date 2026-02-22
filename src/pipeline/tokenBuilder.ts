import type { DesignDecisions, ResolvedTokens } from '../types/pipeline'
import { layoutMap, toneMap, densityMap, typographyMap, sidebarWidthMap, colorMap, shapeMap } from '../tokens/semanticClassMap'

export function buildTokens(decisions: DesignDecisions): ResolvedTokens {
    const layout = layoutMap[decisions.layoutStrategy]
    const tone = toneMap[decisions.visualTone]
    const density = densityMap[decisions.density]
    const typography = typographyMap[decisions.typographyStrategy]
    const sidebarWidth = sidebarWidthMap[decisions.density]
    const shape = shapeMap[decisions.visualTone]

    // Attempt to match the LLM's chosen color, fallback to 'default' if not supported
    const chosenColor = decisions.primaryColorFamily?.toLowerCase() || ''
    let mappedColor = colorMap.default

    for (const key in colorMap) {
        if (chosenColor.includes(key)) {
            mappedColor = colorMap[key]
            break
        }
    }

    return {
        layout: {
            ...layout,
            sidebar: `${layout.sidebar} ${sidebarWidth}`,
        },
        tone,
        density,
        typography,
        shape,
        colors: mappedColor,
        morphology: decisions.componentMorphology,
    }
}
