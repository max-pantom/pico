import type { RuntimeDesignTokens } from '../types/pipeline'

export interface AutoLayout {
    direction: 'horizontal' | 'vertical'
    gap: number
    padding: number | { top: number; right: number; bottom: number; left: number }
    alignment: 'start' | 'center' | 'end' | 'space-between' | 'space-around'
    wrap?: boolean
}

export type LayerRole =
    | 'dominant-visual'
    | 'headline'
    | 'supporting-text'
    | 'control'
    | 'navigation'
    | 'ambient'
    | 'background'

export type LayerType = 'frame' | 'text' | 'shape' | 'image' | 'group'

export type SizeValue = number | 'fill' | 'hug'

export interface DesignLayer {
    id: string
    name: string
    role: LayerRole
    type: LayerType
    /** Position. Required for top-level and freeform layers. Omit for children of auto-layout frames. */
    x?: number
    y?: number
    width: SizeValue
    height: SizeValue
    zIndex: number
    /** For frames: children stack via flexbox. Frame itself gets x, y, width, height. */
    autoLayout?: AutoLayout
    fill?: string
    gradient?: { from: string; to: string; via?: string }
    opacity?: number
    radius?: number | number[]
    border?: string
    /** Rotation in degrees. Freeform layers only. */
    rotation?: number
    /** Blur in px. Freeform layers only. */
    blur?: number
    content?: string
    fontSize?: number
    fontWeight?: number
    fontFamily?: string
    letterSpacing?: number
    lineHeight?: number
    color?: string
    children?: DesignLayer[]
}

export interface DesignFrame {
    id: string
    name: string
    type: 'screen' | 'section' | 'overlay'
    width: number
    height: number
    background?: string
    layers: DesignLayer[]
}

export interface DesignDocument {
    name: string
    frame: DesignFrame
    tokens: RuntimeDesignTokens
}
