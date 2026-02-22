export const layoutMap = {
    'sidebar-main': {
        wrapper: 'flex h-screen overflow-hidden',
        sidebar: 'shrink-0 flex flex-col overflow-y-auto',
        main: 'flex-1 overflow-y-auto flex flex-col',
    },
    'top-nav-content': {
        wrapper: 'flex flex-col h-screen overflow-hidden',
        sidebar: 'w-full shrink-0',
        main: 'flex-1 overflow-y-auto',
    },
    'split-panel': {
        wrapper: 'flex h-screen overflow-hidden',
        sidebar: 'w-1/2 shrink-0 border-r overflow-y-auto',
        main: 'w-1/2 overflow-y-auto',
    },
    'dense-grid': {
        wrapper: 'flex h-screen overflow-hidden',
        sidebar: 'hidden',
        main: 'flex-1 overflow-y-auto',
    },
    'canvas': {
        wrapper: 'flex flex-col h-screen',
        sidebar: 'hidden',
        main: 'flex-1 overflow-auto',
    },
} as const

export const toneMap = {
    clinical: {
        surface: 'bg-slate-100',
        card: 'bg-white border border-slate-200',
        text: 'text-slate-900',
        muted: 'text-slate-500',
        accent: 'text-red-600',
        shadow: 'shadow-sm',
        border: 'border-slate-200',
    },
    minimal: {
        surface: 'bg-white',
        card: 'bg-white border border-gray-100',
        text: 'text-gray-900',
        muted: 'text-gray-400',
        accent: 'text-blue-600',
        shadow: 'shadow-md shadow-gray-100/50',
        border: 'border-gray-100',
    },
    bold: {
        surface: 'bg-gray-950',
        card: 'bg-gray-900 border border-gray-700',
        text: 'text-white',
        muted: 'text-gray-400',
        accent: 'text-violet-400',
        shadow: 'shadow-2xl shadow-black/40',
        border: 'border-gray-700',
    },
    playful: {
        surface: 'bg-amber-50',
        card: 'bg-white border border-amber-100',
        text: 'text-gray-900',
        muted: 'text-gray-400',
        accent: 'text-orange-500',
        shadow: 'shadow-lg shadow-orange-900/5',
        border: 'border-amber-100',
    },
    editorial: {
        surface: 'bg-stone-50',
        card: 'bg-white border-l-2 border-stone-900',
        text: 'text-stone-900',
        muted: 'text-stone-500',
        accent: 'text-red-700',
        shadow: '',
        border: 'border-stone-200',
    },
    stripe: {
        surface: 'bg-gray-50',
        card: 'bg-white border border-gray-200 rounded-lg',
        text: 'text-gray-900',
        muted: 'text-gray-500',
        accent: 'text-blue-600',
        shadow: 'shadow-sm',
        border: 'border-gray-200',
    },
    linear: {
        surface: 'bg-gray-950',
        card: 'bg-gray-900 border border-gray-800 rounded-md',
        text: 'text-gray-100',
        muted: 'text-gray-500',
        accent: 'text-violet-400',
        shadow: '',
        border: 'border-gray-800',
    },
    vercel: {
        surface: 'bg-black',
        card: 'bg-black border border-white/10 rounded-lg',
        text: 'text-white',
        muted: 'text-white/40',
        accent: 'text-white',
        shadow: '',
        border: 'border-white/10',
    },
    bloomberg: {
        surface: 'bg-black',
        card: 'bg-gray-950 border border-orange-900/30 rounded-none',
        text: 'text-orange-50',
        muted: 'text-orange-200/50',
        accent: 'text-orange-400',
        shadow: '',
        border: 'border-orange-900/30',
    },
    notion: {
        surface: 'bg-stone-50',
        card: 'bg-white border border-stone-200 rounded-sm',
        text: 'text-stone-900',
        muted: 'text-stone-400',
        accent: 'text-stone-900',
        shadow: '',
        border: 'border-stone-200',
    },
    duolingo: {
        surface: 'bg-white',
        card: 'bg-white border-2 border-gray-100 rounded-2xl',
        text: 'text-gray-800',
        muted: 'text-gray-400',
        accent: 'text-green-500',
        shadow: 'shadow-lg shadow-green-100',
        border: 'border-gray-100',
    },
    'apple-health': {
        surface: 'bg-gray-50',
        card: 'bg-white border border-transparent rounded-2xl',
        text: 'text-gray-900',
        muted: 'text-gray-400',
        accent: 'text-red-500',
        shadow: 'shadow-md shadow-gray-200',
        border: 'border-transparent',
    },
} as const

export const shapeMap = {
    clinical: {
        button: 'rounded-sm',
        card: 'rounded',
        input: 'rounded-sm',
        badge: 'rounded',
    },
    minimal: {
        button: 'rounded-md',
        card: 'rounded-xl',
        input: 'rounded-md',
        badge: 'rounded-full',
    },
    bold: {
        button: 'rounded-none',
        card: 'rounded-sm',
        input: 'rounded-none',
        badge: 'rounded-sm',
    },
    playful: {
        button: 'rounded-full',
        card: 'rounded-3xl',
        input: 'rounded-xl',
        badge: 'rounded-full',
    },
    editorial: {
        button: 'rounded-sm',
        card: 'rounded-none',
        input: 'rounded-sm',
        badge: 'rounded-none',
    },
    stripe: {
        button: 'rounded-md',
        card: 'rounded-lg',
        input: 'rounded-md',
        badge: 'rounded-full',
    },
    linear: {
        button: 'rounded-md',
        card: 'rounded-md',
        input: 'rounded-md',
        badge: 'rounded-md',
    },
    vercel: {
        button: 'rounded-lg',
        card: 'rounded-lg',
        input: 'rounded-lg',
        badge: 'rounded-full',
    },
    bloomberg: {
        button: 'rounded-none',
        card: 'rounded-none',
        input: 'rounded-none',
        badge: 'rounded-none',
    },
    notion: {
        button: 'rounded-sm',
        card: 'rounded-sm',
        input: 'rounded-sm',
        badge: 'rounded-sm',
    },
    duolingo: {
        button: 'rounded-full',
        card: 'rounded-2xl',
        input: 'rounded-xl',
        badge: 'rounded-full',
    },
    'apple-health': {
        button: 'rounded-xl',
        card: 'rounded-2xl',
        input: 'rounded-xl',
        badge: 'rounded-full',
    },
} as const

export const densityMap = {
    compact: {
        card: 'p-3 gap-2',
        table: 'py-1.5 px-3 text-xs',
        section: 'space-y-3',
        nav: 'py-1.5 px-3 text-xs',
    },
    comfortable: {
        card: 'p-5 gap-4',
        table: 'py-2.5 px-4 text-sm',
        section: 'space-y-6',
        nav: 'py-2.5 px-4 text-sm',
    },
    spacious: {
        card: 'p-8 gap-6',
        table: 'py-4 px-6 text-sm',
        section: 'space-y-10',
        nav: 'py-4 px-6 text-sm',
    },
} as const

export const typographyMap = {
    utilitarian: {
        heading: 'text-sm font-semibold tracking-tight',
        subheading: 'text-xs font-medium',
        body: 'text-xs font-normal',
        label: 'text-xs font-medium uppercase tracking-wide',
        micro: 'text-xs font-normal opacity-60',
    },
    expressive: {
        heading: 'text-2xl font-bold tracking-tight',
        subheading: 'text-base font-semibold',
        body: 'text-sm font-normal leading-relaxed',
        label: 'text-xs font-semibold uppercase tracking-widest',
        micro: 'text-xs font-normal opacity-50',
    },
    editorial: {
        heading: 'text-3xl font-black tracking-tighter',
        subheading: 'text-lg font-bold',
        body: 'text-base font-normal leading-loose',
        label: 'text-xs font-bold uppercase tracking-widest',
        micro: 'text-sm italic opacity-60',
    },
    display: {
        heading: 'text-2xl font-black tracking-tight',
        subheading: 'text-base font-semibold',
        body: 'text-sm font-normal leading-relaxed',
        label: 'text-xs font-semibold uppercase tracking-widest',
        micro: 'text-xs font-normal opacity-60',
    },
    prose: {
        heading: 'text-3xl font-bold tracking-tight',
        subheading: 'text-lg font-bold',
        body: 'text-base font-normal leading-loose',
        label: 'text-sm italic',
        micro: 'text-sm italic opacity-60',
    },
    terminal: {
        heading: 'text-xs font-bold tracking-widest uppercase',
        subheading: 'text-xs font-semibold tracking-wider',
        body: 'text-xs font-normal',
        label: 'text-xs uppercase tracking-wider opacity-60',
        micro: 'text-xs opacity-50',
    },
} as const

export const sidebarWidthMap = {
    compact: 'w-48',
    comfortable: 'w-60',
    spacious: 'w-72',
} as const

export const colorMap: Record<string, {
    primaryBg: string
    primaryHover: string
    primaryText: string
    accentBg: string
    accentText: string
    surfaceBg: string
    surfaceBorder: string
}> = {
    blue: {
        primaryBg: 'bg-blue-600',
        primaryHover: 'hover:bg-blue-700',
        primaryText: 'text-white',
        accentBg: 'bg-blue-100',
        accentText: 'text-blue-700',
        surfaceBg: 'bg-blue-50',
        surfaceBorder: 'border-blue-200',
    },
    emerald: {
        primaryBg: 'bg-emerald-600',
        primaryHover: 'hover:bg-emerald-700',
        primaryText: 'text-white',
        accentBg: 'bg-emerald-100',
        accentText: 'text-emerald-700',
        surfaceBg: 'bg-emerald-50',
        surfaceBorder: 'border-emerald-200',
    },
    rose: {
        primaryBg: 'bg-rose-600',
        primaryHover: 'hover:bg-rose-700',
        primaryText: 'text-white',
        accentBg: 'bg-rose-100',
        accentText: 'text-rose-700',
        surfaceBg: 'bg-rose-50',
        surfaceBorder: 'border-rose-200',
    },
    amber: {
        primaryBg: 'bg-amber-600',
        primaryHover: 'hover:bg-amber-700',
        primaryText: 'text-amber-950',
        accentBg: 'bg-amber-100',
        accentText: 'text-amber-700',
        surfaceBg: 'bg-amber-50',
        surfaceBorder: 'border-amber-200',
    },
    slate: {
        primaryBg: 'bg-slate-800',
        primaryHover: 'hover:bg-slate-900',
        primaryText: 'text-white',
        accentBg: 'bg-slate-200',
        accentText: 'text-slate-800',
        surfaceBg: 'bg-slate-50',
        surfaceBorder: 'border-slate-200',
    },
    violet: {
        primaryBg: 'bg-violet-600',
        primaryHover: 'hover:bg-violet-700',
        primaryText: 'text-white',
        accentBg: 'bg-violet-100',
        accentText: 'text-violet-700',
        surfaceBg: 'bg-violet-50',
        surfaceBorder: 'border-violet-200',
    },
    indigo: {
        primaryBg: 'bg-indigo-600',
        primaryHover: 'hover:bg-indigo-700',
        primaryText: 'text-white',
        accentBg: 'bg-indigo-100',
        accentText: 'text-indigo-700',
        surfaceBg: 'bg-indigo-50',
        surfaceBorder: 'border-indigo-200',
    },
    default: {
        primaryBg: 'bg-gray-900',
        primaryHover: 'hover:bg-gray-800',
        primaryText: 'text-white',
        accentBg: 'bg-gray-100',
        accentText: 'text-gray-900',
        surfaceBg: 'bg-gray-50',
        surfaceBorder: 'border-gray-200',
    }
}
