import type { DesignDecisions, ResolvedTokens, RuntimeDesignTokens } from '../types/pipeline'

const DEFAULT_RUNTIME_TOKENS: RuntimeDesignTokens = {
    colors: {
        background: '#f8fafc',
        surface: '#ffffff',
        primary: '#2563eb',
        accent: '#7c3aed',
        text: '#0f172a',
        muted: '#64748b',
        border: '#e2e8f0',
        onPrimary: '#ffffff',
    },
    typography: {
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        baseSize: '14px',
        headingWeight: '700',
        headingTracking: '-0.02em',
    },
    spacing: {
        cardPadding: '16px',
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
        card: '0 1px 3px rgba(15, 23, 42, 0.08)',
        elevated: '0 12px 28px rgba(15, 23, 42, 0.14)',
    },
    layout: {
        sidebarWidth: '260px',
        topNavHeight: '64px',
    },
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0
}

function withFallback(runtime?: RuntimeDesignTokens): RuntimeDesignTokens {
    return {
        colors: {
            background: isNonEmptyString(runtime?.colors.background) ? runtime.colors.background : DEFAULT_RUNTIME_TOKENS.colors.background,
            surface: isNonEmptyString(runtime?.colors.surface) ? runtime.colors.surface : DEFAULT_RUNTIME_TOKENS.colors.surface,
            primary: isNonEmptyString(runtime?.colors.primary) ? runtime.colors.primary : DEFAULT_RUNTIME_TOKENS.colors.primary,
            accent: isNonEmptyString(runtime?.colors.accent) ? runtime.colors.accent : DEFAULT_RUNTIME_TOKENS.colors.accent,
            text: isNonEmptyString(runtime?.colors.text) ? runtime.colors.text : DEFAULT_RUNTIME_TOKENS.colors.text,
            muted: isNonEmptyString(runtime?.colors.muted) ? runtime.colors.muted : DEFAULT_RUNTIME_TOKENS.colors.muted,
            border: isNonEmptyString(runtime?.colors.border) ? runtime.colors.border : DEFAULT_RUNTIME_TOKENS.colors.border,
            onPrimary: isNonEmptyString(runtime?.colors.onPrimary) ? runtime.colors.onPrimary : DEFAULT_RUNTIME_TOKENS.colors.onPrimary,
        },
        typography: {
            fontFamily: isNonEmptyString(runtime?.typography.fontFamily) ? runtime.typography.fontFamily : DEFAULT_RUNTIME_TOKENS.typography.fontFamily,
            baseSize: isNonEmptyString(runtime?.typography.baseSize) ? runtime.typography.baseSize : DEFAULT_RUNTIME_TOKENS.typography.baseSize,
            headingWeight: isNonEmptyString(runtime?.typography.headingWeight) ? runtime.typography.headingWeight : DEFAULT_RUNTIME_TOKENS.typography.headingWeight,
            headingTracking: isNonEmptyString(runtime?.typography.headingTracking) ? runtime.typography.headingTracking : DEFAULT_RUNTIME_TOKENS.typography.headingTracking,
        },
        spacing: {
            cardPadding: isNonEmptyString(runtime?.spacing.cardPadding) ? runtime.spacing.cardPadding : DEFAULT_RUNTIME_TOKENS.spacing.cardPadding,
            sectionGap: isNonEmptyString(runtime?.spacing.sectionGap) ? runtime.spacing.sectionGap : DEFAULT_RUNTIME_TOKENS.spacing.sectionGap,
            navItemPadding: isNonEmptyString(runtime?.spacing.navItemPadding) ? runtime.spacing.navItemPadding : DEFAULT_RUNTIME_TOKENS.spacing.navItemPadding,
        },
        radius: {
            card: isNonEmptyString(runtime?.radius.card) ? runtime.radius.card : DEFAULT_RUNTIME_TOKENS.radius.card,
            button: isNonEmptyString(runtime?.radius.button) ? runtime.radius.button : DEFAULT_RUNTIME_TOKENS.radius.button,
            input: isNonEmptyString(runtime?.radius.input) ? runtime.radius.input : DEFAULT_RUNTIME_TOKENS.radius.input,
            badge: isNonEmptyString(runtime?.radius.badge) ? runtime.radius.badge : DEFAULT_RUNTIME_TOKENS.radius.badge,
        },
        shadow: {
            card: isNonEmptyString(runtime?.shadow.card) ? runtime.shadow.card : DEFAULT_RUNTIME_TOKENS.shadow.card,
            elevated: isNonEmptyString(runtime?.shadow.elevated) ? runtime.shadow.elevated : DEFAULT_RUNTIME_TOKENS.shadow.elevated,
        },
        layout: {
            sidebarWidth: isNonEmptyString(runtime?.layout.sidebarWidth) ? runtime.layout.sidebarWidth : DEFAULT_RUNTIME_TOKENS.layout.sidebarWidth,
            topNavHeight: isNonEmptyString(runtime?.layout.topNavHeight) ? runtime.layout.topNavHeight : DEFAULT_RUNTIME_TOKENS.layout.topNavHeight,
        },
    }
}

function buildCssVars(runtime: RuntimeDesignTokens): Record<string, string> {
    return {
        '--color-background': runtime.colors.background,
        '--color-surface': runtime.colors.surface,
        '--color-primary': runtime.colors.primary,
        '--color-accent': runtime.colors.accent,
        '--color-text': runtime.colors.text,
        '--color-muted': runtime.colors.muted,
        '--color-border': runtime.colors.border,
        '--color-on-primary': runtime.colors.onPrimary || '#ffffff',
        '--font-family': runtime.typography.fontFamily,
        '--font-size-base': runtime.typography.baseSize,
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
            heading: 'text-2xl font-bold tracking-[var(--letter-spacing-heading)]',
            subheading: 'text-base font-semibold',
            body: 'text-[var(--font-size-base)] leading-relaxed',
            label: 'text-xs font-semibold uppercase tracking-wider',
            micro: 'text-xs opacity-70',
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
    layoutStrategy: DesignDecisions['layoutStrategy'] = 'top-nav-content'
): ResolvedTokens {
    return buildResolvedTokens(runtimeTokens, { layoutStrategy })
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
