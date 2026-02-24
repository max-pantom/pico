import { Shell } from './components/Shell'
import { Sidebar } from './components/Sidebar'
import { TopNav } from './components/TopNav'
import { PageContent } from './components/PageContent'
import { ListPanel } from './components/ListPanel'
import { DetailPanel } from './components/DetailPanel'
import { DenseGrid } from './components/DenseGrid'
import { HeroSection } from './components/HeroSection'
import { WorkGrid } from './components/WorkGrid'
import { FeatureGrid } from './components/FeatureGrid'
import { CTASection } from './components/CTASection'
import { FooterSection } from './components/FooterSection'
import { Header } from './components/Header'
import { NavItem } from './components/NavItem'
import { MainContent } from './components/MainContent'
import { Card } from './components/Card'
import { StatBlock } from './components/StatBlock'
import { MetricCard } from './components/MetricCard'
import { ChartBlock } from './components/ChartBlock'
import { ActivityFeed } from './components/ActivityFeed'
import { KPIRow } from './components/KPIRow'
import { DataTable } from './components/DataTable'
import { Button } from './components/Button'
import { Input } from './components/Input'
import { FormGroup } from './components/FormGroup'
import { Badge } from './components/Badge'
import { Tabs } from './components/Tabs'
import { Divider } from './components/Divider'
import type { ComponentName } from '../../types/pipeline'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ComponentRegistry: Record<ComponentName, React.ComponentType<any>> = {
    Shell,
    Sidebar,
    TopNav,
    PageContent,
    ListPanel,
    DetailPanel,
    DenseGrid,
    HeroSection,
    WorkGrid,
    FeatureGrid,
    CTASection,
    FooterSection,
    Header,
    NavItem,
    MainContent,
    Card,
    StatBlock,
    MetricCard,
    ChartBlock,
    ActivityFeed,
    KPIRow,
    DataTable,
    Button,
    Input,
    FormGroup,
    Badge,
    Tabs,
    Divider,
}
