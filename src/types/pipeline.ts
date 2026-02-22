export type ProductType =
    | 'dashboard'
    | 'landing'
    | 'onboarding'
    | 'settings'
    | 'admin'
    | 'feed'
    | 'ecommerce'
    | 'documentation'
    | 'portal'
    | 'mobile-app'
    | 'form'
    | 'tool'
    | 'portfolio'
export type DensityLevel = 'compact' | 'comfortable' | 'spacious'
export type VisualTone =
    | 'clinical'
    | 'minimal'
    | 'bold'
    | 'playful'
    | 'editorial'
    | 'stripe'
    | 'linear'
    | 'vercel'
    | 'bloomberg'
    | 'notion'
    | 'duolingo'
    | 'apple-health'
export type LayoutStrategy = 'sidebar-main' | 'top-nav-content' | 'split-panel' | 'dense-grid' | 'canvas'
export type NavigationPosition = 'left-rail' | 'top' | 'bottom' | 'none'
export type TypographyStrategy =
    | 'utilitarian'
    | 'expressive'
    | 'editorial'
    | 'display'
    | 'prose'
    | 'terminal'
export type InteractionModel = 'click-to-drill' | 'inline-expand' | 'modal' | 'side-panel'
export type CardMorphology = 'flat' | 'elevated' | 'bordered' | 'panel'
export type TableMorphology = 'dense' | 'striped' | 'minimal'
export type ButtonMorphology = 'label' | 'icon-label' | 'pill'

export interface RuntimeDesignTokens {
    colors: {
        background: string
        surface: string
        primary: string
        accent: string
        text: string
        muted: string
        border: string
        onPrimary?: string
    }
    typography: {
        fontFamily: string
        baseSize: string
        headingSize?: string
        bodySize?: string
        headingWeight: string
        headingTracking: string
    }
    spacing: {
        cardPadding: string
        sectionGap: string
        navItemPadding: string
        heroPadding?: string
        headlineMargin?: string
    }
    radius: {
        card: string
        button: string
        input: string
        badge: string
    }
    shadow: {
        card: string
        elevated: string
    }
    layout: {
        sidebarWidth: string
        topNavHeight: string
    }
}

export interface RuntimeMockData {
    table?: {
        columns: string[]
        rows: string[][]
    }
    stats?: Array<{
        label: string
        value: string
        trend?: string
        trendDirection?: 'up' | 'down' | 'neutral'
    }>
    activity?: string[]
}

export interface IntentJSON {
    productType: ProductType
    domain: string
    primaryUser: string
    coreTasks: string[]
    informationDensity: DensityLevel
    realTimeRequirement: boolean
    emotionalTone: string
    scale: 'desktop' | 'mobile' | 'both'
}

export interface ComponentMorphology {
    cards: CardMorphology
    tables: TableMorphology
    buttons: ButtonMorphology
    inputs: string
}

export interface DesignDecisions {
    layoutStrategy: LayoutStrategy
    navigationPosition: NavigationPosition
    density: DensityLevel
    visualTone: VisualTone
    primaryColorFamily: string
    accentUsage: string
    typographyStrategy: TypographyStrategy
    componentMorphology: ComponentMorphology
    contentArchitecture: string[]
    hierarchyFlow: string[]
    interactionModel: InteractionModel
    runtimeTokens?: RuntimeDesignTokens
    mockData?: RuntimeMockData
}

export type ComponentName =
    | 'Shell'
    | 'Sidebar'
    | 'TopNav'
    | 'PageContent'
    | 'ListPanel'
    | 'DetailPanel'
    | 'DenseGrid'
    | 'HeroSection'
    | 'WorkGrid'
    | 'FeatureGrid'
    | 'CTASection'
    | 'FooterSection'
    | 'Header'
    | 'NavItem'
    | 'MainContent'
    | 'Card'
    | 'StatBlock'
    | 'MetricCard'
    | 'ChartBlock'
    | 'ActivityFeed'
    | 'KPIRow'
    | 'DataTable'
    | 'Button'
    | 'Input'
    | 'FormGroup'
    | 'Badge'
    | 'Tabs'
    | 'Divider'

export interface LayoutNode {
    component: ComponentName
    props?: Record<string, unknown>
    children?: LayoutNode[]
}

export interface ResolvedTokens {
    layout: {
        wrapper: string
        sidebar: string
        main: string
    }
    tone: {
        surface: string
        card: string
        text: string
        muted: string
        accent: string
        shadow: string
        border: string
    }
    density: {
        card: string
        table: string
        section: string
        nav: string
    }
    typography: {
        heading: string
        subheading: string
        body: string
        label: string
        micro: string
    }
    shape: {
        button: string
        card: string
        input: string
        badge: string
    }
    colors: {
        primaryBg: string
        primaryHover: string
        primaryText: string
        accentBg: string
        accentText: string
        surfaceBg: string
        surfaceBorder: string
    }
    morphology: {
        cards: CardMorphology
        tables: TableMorphology
        buttons: ButtonMorphology
    }
    runtime: RuntimeDesignTokens
    cssVars: Record<string, string>
}

export interface AppStateVariable {
    name: string
    type: string
    initialValue: unknown
}

export interface AppStateHandler {
    name: string
    parameters: string[]
    body: string
}

export interface AppState {
    variables: AppStateVariable[]
    handlers: AppStateHandler[]
}

export interface PipelineOutput {
    intent: IntentJSON
    decisions: DesignDecisions
    tokens: ResolvedTokens
    layout: LayoutNode
    mainChildren: LayoutNode[]
    appState?: AppState
    reactSourceCode?: string
    qualityScore: number
    qualityIssues: string[]
}

export type PipelineStage = 'idle' | 'parsing' | 'reasoning' | 'building' | 'rendering' | 'done' | 'error'
