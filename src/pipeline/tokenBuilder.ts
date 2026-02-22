import type { DesignDecisions, ResolvedTokens, RuntimeDesignTokens } from '../types/pipeline'

const DEFAULT_RUNTIME_TOKENS: RuntimeDesignTokens = {
    colors: {
        background: '#0a0a0b',
        surface: '#141416',
        surfaceAlt: '#1c1c1f',
        primary: '#6366f1',
        accent: '#8b5cf6',
        text: '#f0f0f3',
        muted: '#71717a',
        border: '#27272a',
        onPrimary: '#ffffff',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        gradientFrom: '#6366f1',
        gradientVia: '#8b5cf6',
        gradientTo: '#ec4899',
        chart1: '#6366f1',
        chart2: '#8b5cf6',
        chart3: '#06b6d4',
        chart4: '#22c55e',
        chart5: '#f59e0b',
    },
    typography: {
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        displayFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        monoFamily: 'JetBrains Mono, ui-monospace, monospace',
        baseSize: '14px',
        displaySize: '48px',
        headingWeight: '700',
        headingTracking: '-0.025em',
        scaleRatio: '1.25',
    },
    spacing: {
        cardPadding: '20px',
        sectionGap: '24px',
        navItemPadding: '8px 12px',
    },
    radius: {
        card: '12px',
        button: '10px',
        input: '10px',
        badge: '999px',
    },
    shadow: {
        card: '0 1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.12)',
        elevated: '0 20px 40px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.2)',
    },
    layout: {
        sidebarWidth: '260px',
        topNavHeight: '64px',
    },
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0
}

function safe(val: unknown, fallback: string): string {
    return isNonEmptyString(val) ? val : fallback
}

function withFallback(runtime?: RuntimeDesignTokens): RuntimeDesignTokens {
    const d = DEFAULT_RUNTIME_TOKENS
    return {
        colors: {
            background: safe(runtime?.colors.background, d.colors.background),
            surface: safe(runtime?.colors.surface, d.colors.surface),
            surfaceAlt: safe(runtime?.colors.surfaceAlt, d.colors.surfaceAlt),
            primary: safe(runtime?.colors.primary, d.colors.primary),
            accent: safe(runtime?.colors.accent, d.colors.accent),
            text: safe(runtime?.colors.text, d.colors.text),
            muted: safe(runtime?.colors.muted, d.colors.muted),
            border: safe(runtime?.colors.border, d.colors.border),
            onPrimary: safe(runtime?.colors.onPrimary, d.colors.onPrimary!),
            success: safe(runtime?.colors.success, d.colors.success),
            warning: safe(runtime?.colors.warning, d.colors.warning),
            error: safe(runtime?.colors.error, d.colors.error),
            info: safe(runtime?.colors.info, d.colors.info),
            gradientFrom: safe(runtime?.colors.gradientFrom, d.colors.gradientFrom),
            gradientVia: safe(runtime?.colors.gradientVia, d.colors.gradientVia),
            gradientTo: safe(runtime?.colors.gradientTo, d.colors.gradientTo),
            chart1: safe(runtime?.colors.chart1, d.colors.chart1),
            chart2: safe(runtime?.colors.chart2, d.colors.chart2),
            chart3: safe(runtime?.colors.chart3, d.colors.chart3),
            chart4: safe(runtime?.colors.chart4, d.colors.chart4),
            chart5: safe(runtime?.colors.chart5, d.colors.chart5),
        },
        typography: {
            fontFamily: safe(runtime?.typography.fontFamily, d.typography.fontFamily),
            displayFamily: safe(runtime?.typography.displayFamily, d.typography.displayFamily),
            monoFamily: safe(runtime?.typography.monoFamily, d.typography.monoFamily),
            baseSize: safe(runtime?.typography.baseSize, d.typography.baseSize),
            displaySize: safe(runtime?.typography.displaySize, d.typography.displaySize),
            headingWeight: safe(runtime?.typography.headingWeight, d.typography.headingWeight),
            headingTracking: safe(runtime?.typography.headingTracking, d.typography.headingTracking),
            scaleRatio: safe(runtime?.typography.scaleRatio, d.typography.scaleRatio),
        },
        spacing: {
            cardPadding: safe(runtime?.spacing.cardPadding, d.spacing.cardPadding),
            sectionGap: safe(runtime?.spacing.sectionGap, d.spacing.sectionGap),
            navItemPadding: safe(runtime?.spacing.navItemPadding, d.spacing.navItemPadding),
        },
        radius: {
            card: safe(runtime?.radius.card, d.radius.card),
            button: safe(runtime?.radius.button, d.radius.button),
            input: safe(runtime?.radius.input, d.radius.input),
            badge: safe(runtime?.radius.badge, d.radius.badge),
        },
        shadow: {
            card: safe(runtime?.shadow.card, d.shadow.card),
            elevated: safe(runtime?.shadow.elevated, d.shadow.elevated),
        },
        layout: {
            sidebarWidth: safe(runtime?.layout.sidebarWidth, d.layout.sidebarWidth),
            topNavHeight: safe(runtime?.layout.topNavHeight, d.layout.topNavHeight),
        },
    }
}

function buildCssVars(runtime: RuntimeDesignTokens): Record<string, string> {
    return {
        '--color-background': runtime.colors.background,
        '--color-surface': runtime.colors.surface,
        '--color-surface-alt': runtime.colors.surfaceAlt,
        '--color-primary': runtime.colors.primary,
        '--color-accent': runtime.colors.accent,
        '--color-text': runtime.colors.text,
        '--color-muted': runtime.colors.muted,
        '--color-border': runtime.colors.border,
        '--color-on-primary': runtime.colors.onPrimary || '#ffffff',
        '--color-success': runtime.colors.success,
        '--color-warning': runtime.colors.warning,
        '--color-error': runtime.colors.error,
        '--color-info': runtime.colors.info,
        '--color-gradient-from': runtime.colors.gradientFrom,
        '--color-gradient-via': runtime.colors.gradientVia,
        '--color-gradient-to': runtime.colors.gradientTo,
        '--color-chart-1': runtime.colors.chart1,
        '--color-chart-2': runtime.colors.chart2,
        '--color-chart-3': runtime.colors.chart3,
        '--color-chart-4': runtime.colors.chart4,
        '--color-chart-5': runtime.colors.chart5,
        '--font-family': runtime.typography.fontFamily,
        '--font-display': runtime.typography.displayFamily,
        '--font-mono': runtime.typography.monoFamily,
        '--font-size-base': runtime.typography.baseSize,
        '--font-size-display': runtime.typography.displaySize,
        '--font-weight-heading': runtime.typography.headingWeight,
        '--letter-spacing-heading': runtime.typography.headingTracking,
        '--spacing-card': runtime.spacing.cardPadding,
        '--spacing-section': runtime.spacing.sectionGap,
        '--spacing-nav': runtime.spacing.navItemPadding,
        '--radius-card': runtime.radius.card,
        '--radius-button': runtime.radius.button,
        '--radius-input': runtime.radius.input,
        '--radius-badge': runtime.radius.badge,
        '--shadow-card': runtime.shadow.card,
        '--shadow-elevated': runtime.shadow.elevated,
        '--layout-sidebar-width': runtime.layout.sidebarWidth,
        '--layout-topnav-height': runtime.layout.topNavHeight,
    }
}

interface TokenBuildOptions {
    layoutStrategy: DesignDecisions['layoutStrategy']
    morphology?: {
        cards: DesignDecisions['componentMorphology']['cards']
        tables: DesignDecisions['componentMorphology']['tables']
        buttons: DesignDecisions['componentMorphology']['buttons']
    }
}

function buildResolvedTokens(runtimeInput: RuntimeDesignTokens | undefined, options: TokenBuildOptions): ResolvedTokens {
    const runtime = withFallback(runtimeInput)
    const cssVars = buildCssVars(runtime)

    const layoutByStrategy = options.layoutStrategy === 'top-nav-content'
        ? {
            wrapper: 'flex h-screen flex-col overflow-hidden bg-[var(--color-background)]',
            sidebar: 'w-full shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)]',
            main: 'flex-1 overflow-y-auto',
        }
        : options.layoutStrategy === 'split-panel'
            ? {
                wrapper: 'flex h-screen overflow-hidden bg-[var(--color-background)]',
                sidebar: 'w-[40%] shrink-0 overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-surface)]',
                main: 'flex-1 overflow-y-auto',
            }
            : {
                wrapper: 'flex h-screen overflow-hidden bg-[var(--color-background)]',
                sidebar: 'w-[var(--layout-sidebar-width)] shrink-0 flex flex-col overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-surface)]',
                main: 'flex-1 overflow-y-auto',
            }

    return {
        layout: layoutByStrategy,
        tone: {
            surface: 'bg-[var(--color-background)]',
            card: 'bg-[var(--color-surface)] border border-[var(--color-border)]',
            text: 'text-[var(--color-text)]',
            muted: 'text-[var(--color-muted)]',
            accent: 'text-[var(--color-accent)]',
            shadow: 'shadow-[var(--shadow-card)]',
            border: 'border-[var(--color-border)]',
        },
        density: {
            card: 'p-[var(--spacing-card)] gap-3',
            table: 'py-2 px-3 text-[var(--font-size-base)]',
            section: 'space-y-[var(--spacing-section)]',
            nav: 'px-3 py-2',
        },
        typography: {
            display: 'text-[var(--font-size-display)] font-[var(--font-weight-heading)] tracking-[var(--letter-spacing-heading)] leading-[1.1] font-[family-name:var(--font-display)]',
            heading: 'text-2xl font-bold tracking-[var(--letter-spacing-heading)] leading-tight',
            subheading: 'text-base font-semibold leading-snug',
            body: 'text-[var(--font-size-base)] leading-relaxed',
            label: 'text-xs font-semibold uppercase tracking-wider',
            micro: 'text-[11px] leading-snug',
            mono: 'font-[family-name:var(--font-mono)] text-[13px] tabular-nums',
        },
        shape: {
            button: 'rounded-[var(--radius-button)]',
            card: 'rounded-[var(--radius-card)]',
            input: 'rounded-[var(--radius-input)]',
            badge: 'rounded-[var(--radius-badge)]',
        },
        colors: {
            primaryBg: 'bg-[var(--color-primary)]',
            primaryHover: 'hover:brightness-110',
            primaryText: 'text-[var(--color-on-primary)]',
            accentBg: 'bg-[var(--color-accent)]/15',
            accentText: 'text-[var(--color-accent)]',
            surfaceBg: 'bg-[var(--color-background)]',
            surfaceBorder: 'border-[var(--color-border)]',
        },
        status: {
            success: 'text-[var(--color-success)]',
            successBg: 'bg-[var(--color-success)]/15 text-[var(--color-success)]',
            warning: 'text-[var(--color-warning)]',
            warningBg: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]',
            error: 'text-[var(--color-error)]',
            errorBg: 'bg-[var(--color-error)]/15 text-[var(--color-error)]',
            info: 'text-[var(--color-info)]',
            infoBg: 'bg-[var(--color-info)]/15 text-[var(--color-info)]',
        },
        gradient: {
            primary: 'bg-gradient-to-r from-[var(--color-gradient-from)] via-[var(--color-gradient-via)] to-[var(--color-gradient-to)]',
            subtle: 'bg-gradient-to-br from-[var(--color-gradient-from)]/10 via-transparent to-[var(--color-gradient-to)]/10',
            hero: 'bg-gradient-to-br from-[var(--color-gradient-from)]/20 via-[var(--color-background)] to-[var(--color-gradient-to)]/20',
            text: 'bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)] bg-clip-text text-transparent',
        },
        chart: {
            colors: [
                runtime.colors.chart1,
                runtime.colors.chart2,
                runtime.colors.chart3,
                runtime.colors.chart4,
                runtime.colors.chart5,
            ],
        },
        morphology: {
            cards: options.morphology?.cards || 'flat',
            tables: options.morphology?.tables || 'minimal',
            buttons: options.morphology?.buttons || 'label',
        },
        runtime,
        cssVars,
    }
}

export function buildTokensFromRuntime(
    runtimeTokens?: RuntimeDesignTokens,
    layoutStrategy: DesignDecisions['layoutStrategy'] = 'top-nav-content',
    morphology?: {
        cards: DesignDecisions['componentMorphology']['cards']
        tables: DesignDecisions['componentMorphology']['tables']
        buttons: DesignDecisions['componentMorphology']['buttons']
    },
): ResolvedTokens {
    return buildResolvedTokens(runtimeTokens, { layoutStrategy, morphology })
}

export function buildTokens(decisions: DesignDecisions): ResolvedTokens {
    return buildResolvedTokens(decisions.runtimeTokens, {
        layoutStrategy: decisions.layoutStrategy,
        morphology: {
            cards: decisions.componentMorphology.cards,
            tables: decisions.componentMorphology.tables,
            buttons: decisions.componentMorphology.buttons,
        },
    })
}
