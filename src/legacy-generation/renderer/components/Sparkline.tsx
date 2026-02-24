import { Area, AreaChart, ResponsiveContainer } from 'recharts'

interface Props {
    data?: number[]
    color?: string
    height?: number
    width?: number
}

const DEFAULT_DATA = [30, 40, 35, 50, 49, 60, 70, 91, 85, 95]

export function Sparkline({ data = DEFAULT_DATA, color = 'var(--color-primary)', height = 32, width = 80 }: Props) {
    const chartData = data.map((v, i) => ({ v, i }))

    return (
        <div style={{ width, height }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`spark-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="v"
                        stroke={color}
                        strokeWidth={1.5}
                        fill={`url(#spark-${color.replace(/[^a-z0-9]/gi, '')})`}
                        dot={false}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
