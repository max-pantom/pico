import {
    Area, AreaChart, Bar, BarChart, CartesianGrid,
    Cell, Line, LineChart, Pie, PieChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import type { ResolvedTokens } from '../../../types/pipeline'
import { asText } from '../safeValue'
import { AnimateIn } from './AnimateIn'

interface Props {
    tokens: ResolvedTokens
    title?: string
    type?: 'line' | 'bar' | 'area' | 'pie'
    data?: Array<Record<string, string | number>>
}

function generateData(type: string): Array<Record<string, string | number>> {
    if (type === 'pie') {
        return [
            { name: 'Direct', value: 400 },
            { name: 'Organic', value: 300 },
            { name: 'Referral', value: 200 },
            { name: 'Social', value: 150 },
            { name: 'Other', value: 100 },
        ]
    }
    return [
        { name: 'Jan', value: 4000, prev: 3200 },
        { name: 'Feb', value: 3000, prev: 3400 },
        { name: 'Mar', value: 5000, prev: 3800 },
        { name: 'Apr', value: 4780, prev: 4200 },
        { name: 'May', value: 5890, prev: 4600 },
        { name: 'Jun', value: 6390, prev: 5000 },
        { name: 'Jul', value: 7490, prev: 5400 },
    ]
}

function CustomTooltip({ active, payload, label }: { active?: boolean, payload?: Array<{ value: number, color: string }>, label?: string }) {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-lg border border-white/10 bg-[var(--color-surface)] px-3 py-2 shadow-xl">
            <p className="text-[11px] text-[var(--color-muted)] mb-1">{label}</p>
            {payload.map((entry, i) => (
                <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
                    {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                </p>
            ))}
        </div>
    )
}

export function ChartBlock({ tokens, title, type = 'area', data }: Props) {
    const safeTitle = asText(title)
    const chartData = data && data.length > 0 ? data : generateData(type)
    const colors = tokens.chart.colors

    return (
        <AnimateIn>
            <div className={`${tokens.tone.card} ${tokens.shape.card} ${tokens.tone.shadow} overflow-hidden`}>
                {safeTitle && (
                    <div className={`${tokens.density.card} border-b ${tokens.tone.border}`}>
                        <h3 className={`${tokens.typography.subheading} ${tokens.tone.text}`}>{safeTitle}</h3>
                    </div>
                )}
                <div className="p-4 pt-6" style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        {type === 'pie' ? (
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((_, i) => (
                                        <Cell key={i} fill={colors[i % colors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        ) : type === 'bar' ? (
                            <BarChart data={chartData} barCategoryGap="20%">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} width={40} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-border)', opacity: 0.3 }} />
                                <Bar dataKey="value" fill={colors[0]} radius={[4, 4, 0, 0]} />
                                {chartData[0]?.prev !== undefined && (
                                    <Bar dataKey="prev" fill={colors[1]} radius={[4, 4, 0, 0]} opacity={0.4} />
                                )}
                            </BarChart>
                        ) : type === 'line' ? (
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} width={40} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={2} dot={false} />
                                {chartData[0]?.prev !== undefined && (
                                    <Line type="monotone" dataKey="prev" stroke={colors[2]} strokeWidth={1.5} strokeDasharray="4 4" dot={false} opacity={0.6} />
                                )}
                            </LineChart>
                        ) : (
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="areaGrad1" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={colors[0]} stopOpacity={0.25} />
                                        <stop offset="100%" stopColor={colors[0]} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={colors[2]} stopOpacity={0.15} />
                                        <stop offset="100%" stopColor={colors[2]} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} width={40} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={2} fill="url(#areaGrad1)" dot={false} />
                                {chartData[0]?.prev !== undefined && (
                                    <Area type="monotone" dataKey="prev" stroke={colors[2]} strokeWidth={1.5} fill="url(#areaGrad2)" dot={false} strokeDasharray="4 4" />
                                )}
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
        </AnimateIn>
    )
}
