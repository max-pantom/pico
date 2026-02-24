import type { DesignDocument, DesignLayer } from '../design/frameModel'
import { resolveAutoLayout } from '../design/autoLayout'

interface Props {
    doc: DesignDocument
}

function resolveSize(
    value: DesignLayer['width'] | DesignLayer['height'],
): string | number {
    if (value === 'fill') return '100%'
    if (value === 'hug') return 'fit-content'
    return typeof value === 'number' ? value : 0
}

function resolveRadius(radius?: number | number[]): string | undefined {
    if (radius === undefined) return undefined
    return Array.isArray(radius)
        ? radius.map(v => `${v}px`).join(' ')
        : `${radius}px`
}

function applyVisualProps(style: React.CSSProperties, layer: DesignLayer): void {
    if (layer.opacity !== undefined) style.opacity = layer.opacity
    const r = resolveRadius(layer.radius)
    if (r) style.borderRadius = r
    if (layer.fill) style.backgroundColor = layer.fill
    if (layer.gradient) {
        const { from, to, via } = layer.gradient
        style.background = via
            ? `linear-gradient(to bottom right, ${from}, ${via}, ${to})`
            : `linear-gradient(to bottom right, ${from}, ${to})`
    }
    if (layer.border) style.border = layer.border
    if (layer.color) style.color = layer.color
    if (layer.fontSize) style.fontSize = layer.fontSize
    if (layer.fontWeight) style.fontWeight = layer.fontWeight
    if (layer.fontFamily) style.fontFamily = layer.fontFamily
    if (layer.letterSpacing !== undefined) style.letterSpacing = layer.letterSpacing
    if (layer.lineHeight !== undefined) style.lineHeight = layer.lineHeight
    if (layer.blur) style.backdropFilter = `blur(${layer.blur}px)`
    if (layer.rotation !== undefined) style.transform = `rotate(${layer.rotation}deg)`
}

function layerStyle(
    layer: DesignLayer,
    isInsideAutoLayout?: boolean,
): React.CSSProperties {
    if (isInsideAutoLayout) {
        const base: React.CSSProperties = {
            width: resolveSize(layer.width) as string | number,
            height: resolveSize(layer.height) as string | number,
            flexShrink: 0,
        }
        applyVisualProps(base, layer)
        return base
    }

    const isAutoLayoutFrame = !!layer.autoLayout
    const x = layer.x ?? 0
    const y = layer.y ?? 0
    const w = layer.width === 'fill' ? '100%' : layer.width === 'hug' ? 'fit-content' : (layer.width as number)
    const h = layer.height === 'fill' ? '100%' : layer.height === 'hug' ? 'fit-content' : (layer.height as number)

    if (isAutoLayoutFrame) {
        const base: React.CSSProperties = {
            position: 'absolute',
            left: x,
            top: y,
            width: w,
            height: h,
            zIndex: layer.zIndex,
            overflow: 'hidden',
            ...resolveAutoLayout(layer.autoLayout!),
        }
        applyVisualProps(base, layer)
        return base
    }

    const base: React.CSSProperties = {
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        zIndex: layer.zIndex,
        overflow: 'hidden',
    }
    applyVisualProps(base, layer)
    return base
}

function LayerNode({
    layer,
    tokens,
    isInsideAutoLayout,
}: {
    layer: DesignLayer
    tokens: DesignDocument['tokens']
    isInsideAutoLayout?: boolean
}) {
    const style = layerStyle(layer, isInsideAutoLayout)
    const defaultColor = tokens.colors.text
    const defaultFontSize = parseInt(tokens.typography.baseSize, 10) || 14
    const defaultFontWeight = parseInt(tokens.typography.headingWeight, 10) || 700

    if (layer.type === 'text') {
        const Tag = layer.role === 'headline' ? 'h2' : 'p'
        return (
            <Tag
                style={{
                    ...style,
                    margin: 0,
                    color: layer.color ?? defaultColor,
                    fontSize: layer.fontSize ?? defaultFontSize,
                    fontWeight: layer.fontWeight ?? defaultFontWeight,
                    lineHeight: layer.lineHeight ?? 1.15,
                    maxWidth: '100%',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                    whiteSpace: 'normal',
                }}
            >
                {layer.content ?? ''}
            </Tag>
        )
    }

    if (layer.type === 'shape' || layer.type === 'frame' || layer.type === 'group') {
        return (
            <div style={style}>
                {layer.content && (
                    <span
                        style={{
                            display: 'block',
                            maxWidth: '100%',
                            color: layer.color ?? defaultColor,
                            fontSize: layer.fontSize ?? defaultFontSize,
                            fontWeight: layer.fontWeight ?? defaultFontWeight,
                            lineHeight: layer.lineHeight ?? 1.2,
                            overflowWrap: 'anywhere',
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
                        }}
                    >
                        {layer.content}
                    </span>
                )}
                {layer.children?.map(child => (
                    <LayerNode
                        key={child.id}
                        layer={child}
                        tokens={tokens}
                        isInsideAutoLayout={!!layer.autoLayout}
                    />
                ))}
            </div>
        )
    }

    if (layer.type === 'image') {
        const placeholderBg = layer.fill
            ? undefined
            : `repeating-linear-gradient(45deg, transparent, transparent 10px, ${tokens.colors.border}22 10px, ${tokens.colors.border}22 11px)`
        return (
            <div
                style={{
                    ...style,
                    ...(placeholderBg && { background: placeholderBg }),
                }}
                title={layer.content}
            />
        )
    }

    return <div style={style} />
}

export function LayerCanvasRenderer({ doc }: Props) {
    const { frame, tokens } = doc
    const { width: frameW, height: frameH, background, layers } = frame

    return (
        <div
            style={{
                width: frameW,
                height: frameH,
                position: 'relative',
                overflow: 'hidden',
                background: background ?? tokens.colors.background,
            }}
        >
            {layers.map(layer => (
                <LayerNode
                    key={layer.id}
                    layer={layer}
                    tokens={tokens}
                />
            ))}
        </div>
    )
}
