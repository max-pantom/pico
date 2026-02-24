import type { CSSProperties } from 'react'
import type { AutoLayout } from './frameModel'

export function resolvePadding(padding: AutoLayout['padding']): string {
    if (typeof padding === 'number') return `${padding}px`
    return `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`
}

export function resolveAutoLayout(autoLayout?: AutoLayout): Omit<CSSProperties, 'position' | 'left' | 'top' | 'width' | 'height'> {
    if (!autoLayout) return {}

    const padding = resolvePadding(autoLayout.padding)

    const alignMap = {
        start: 'flex-start',
        center: 'center',
        end: 'flex-end',
        'space-between': 'space-between',
        'space-around': 'space-around',
    } as const
    const align = alignMap[autoLayout.alignment]

    return {
        display: 'flex',
        flexDirection: autoLayout.direction === 'horizontal' ? 'row' : 'column',
        gap: autoLayout.gap,
        padding,
        alignItems: autoLayout.alignment === 'space-between' || autoLayout.alignment === 'space-around' ? 'stretch' : align,
        justifyContent: align,
        flexWrap: autoLayout.wrap ? 'wrap' : 'nowrap',
    }
}
