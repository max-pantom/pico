import type { Exploration } from '../pipeline/explorationEngine'
import { asText } from './safeValue'

export function HeroRenderer({ exploration }: { exploration: Exploration }) {
    const { tokens, heroLayout } = exploration
    const props = heroLayout.props || {}

    const isLeftAligned = props.layout === 'left-aligned' || props.layout === 'split'
    const secondaryLabel = asText(props.ctaSecondary)
    const headingSize = tokens.typography.headingSize || '48px'
    const bodySize = tokens.typography.bodySize || '16px'
    const heroPadding = tokens.spacing.heroPadding || '48px'
    const headlineMargin = tokens.spacing.headlineMargin || '16px'

    return (
        <div style={{
            ...getBackground(tokens.colors.background, tokens.colors.accent, asText(props.backgroundTreatment, 'solid')),
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: isLeftAligned ? 'flex-start' : 'center',
            textAlign: isLeftAligned ? 'left' : 'center',
            padding: heroPadding,
            fontFamily: fontFamily(tokens.typography.fontFamily),
        }}>
            <h1 style={{
                color: tokens.colors.text,
                fontSize: headingSize,
                fontWeight: tokens.typography.headingWeight,
                letterSpacing: tokens.typography.headingTracking,
                marginBottom: headlineMargin,
                lineHeight: 1.1,
                maxWidth: '680px',
            }}>
                {asText(props.headline, 'A distinct direction')} 
            </h1>

            <p style={{
                color: tokens.colors.muted,
                fontSize: bodySize,
                maxWidth: '520px',
                marginBottom: '28px',
            }}>
                {asText(props.subheadline, exploration.philosophy)}
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button style={{
                    background: tokens.colors.accent,
                    color: tokens.colors.background,
                    border: 'none',
                    borderRadius: tokens.radius.button,
                    padding: '12px 22px',
                    fontSize: bodySize,
                    fontWeight: 600,
                    cursor: 'pointer',
                }}>
                    {asText(props.ctaPrimary, 'Explore')}
                </button>

                {secondaryLabel && (
                    <button style={{
                        background: 'transparent',
                        color: tokens.colors.text,
                        border: `1px solid ${tokens.colors.border}`,
                        borderRadius: tokens.radius.button,
                        padding: '12px 22px',
                        fontSize: bodySize,
                        cursor: 'pointer',
                    }}>
                        {secondaryLabel}
                    </button>
                )}
            </div>
        </div>
    )
}

function fontFamily(name: string): string {
    if (name === 'systemSerif') return 'Iowan Old Style, Georgia, serif'
    if (name === 'systemMono') return 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace'
    return 'Inter, ui-sans-serif, system-ui, sans-serif'
}

function getBackground(background: string, accent: string, treatment: string): { background: string; backgroundImage?: string } {
    if (treatment === 'gradient') {
        return { background: `linear-gradient(135deg, ${background} 0%, ${accent}22 100%)` }
    }

    if (treatment === 'mesh') {
        return {
            background,
            backgroundImage: `radial-gradient(at 35% 20%, ${accent}33 0px, transparent 50%), radial-gradient(at 80% 0%, ${accent}22 0px, transparent 50%)`,
        }
    }

    return { background }
}
