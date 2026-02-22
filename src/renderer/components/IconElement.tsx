import {
    Activity, AlertCircle, Archive, ArrowDown, ArrowRight, ArrowUp, ArrowUpRight,
    BarChart3, Bell, BookOpen, Box, Briefcase, Calendar, Check, CheckCircle,
    ChevronDown, ChevronRight, Clock, Cloud, Code, CreditCard, Database,
    DollarSign, Download, Edit, Eye, FileText, Filter, Folder, Globe,
    Hash, Heart, Home, Image, Inbox, Key, Layers, LayoutDashboard, LineChart,
    Link, List, Lock, LogOut, Mail, Map, Menu, MessageCircle, Monitor,
    MoreHorizontal, Package, PenTool, PieChart, Play, Plus, Rocket, Search,
    Send, Server, Settings, Shield, ShoppingCart, Sparkles, Star, Tag,
    Target, Terminal, TrendingDown, TrendingUp, Trophy, Upload, User, Users,
    Wallet, Zap,
    type LucideIcon,
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
    activity: Activity,
    alert: AlertCircle,
    archive: Archive,
    'arrow-down': ArrowDown,
    'arrow-right': ArrowRight,
    'arrow-up': ArrowUp,
    'arrow-up-right': ArrowUpRight,
    'bar-chart': BarChart3,
    bell: Bell,
    book: BookOpen,
    box: Box,
    briefcase: Briefcase,
    calendar: Calendar,
    check: Check,
    'check-circle': CheckCircle,
    'chevron-down': ChevronDown,
    'chevron-right': ChevronRight,
    clock: Clock,
    cloud: Cloud,
    code: Code,
    'credit-card': CreditCard,
    database: Database,
    dollar: DollarSign,
    download: Download,
    edit: Edit,
    eye: Eye,
    file: FileText,
    filter: Filter,
    folder: Folder,
    globe: Globe,
    hash: Hash,
    heart: Heart,
    home: Home,
    image: Image,
    inbox: Inbox,
    key: Key,
    layers: Layers,
    layout: LayoutDashboard,
    'line-chart': LineChart,
    link: Link,
    list: List,
    lock: Lock,
    logout: LogOut,
    mail: Mail,
    map: Map,
    menu: Menu,
    message: MessageCircle,
    monitor: Monitor,
    more: MoreHorizontal,
    package: Package,
    pen: PenTool,
    'pie-chart': PieChart,
    play: Play,
    plus: Plus,
    rocket: Rocket,
    search: Search,
    send: Send,
    server: Server,
    settings: Settings,
    shield: Shield,
    cart: ShoppingCart,
    sparkles: Sparkles,
    star: Star,
    tag: Tag,
    target: Target,
    terminal: Terminal,
    'trending-down': TrendingDown,
    'trending-up': TrendingUp,
    trophy: Trophy,
    upload: Upload,
    user: User,
    users: Users,
    wallet: Wallet,
    zap: Zap,
}

interface Props {
    name?: string
    size?: number
    className?: string
    strokeWidth?: number
}

export function IconElement({ name, size = 18, className = '', strokeWidth = 1.75 }: Props) {
    if (!name) return null
    const key = name.toLowerCase().trim()
    const Icon = ICON_MAP[key]
    if (!Icon) return null
    return <Icon size={size} className={className} strokeWidth={strokeWidth} />
}

