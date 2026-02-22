import React from 'react'
import type { ResolvedTokens } from '../../types/pipeline'
import { asStringArray, asStringRows, asText } from '../safeValue'
import { AnimateIn } from './AnimateIn'
import { IconElement } from './IconElement'

interface Props {
    tokens: ResolvedTokens
    title?: string
    columns?: string[]
    rows?: string[][]
    icon?: string
    children?: React.ReactNode
}

export function DataTable({ tokens, title, columns, rows, icon }: Props) {
    const cols = asStringArray(columns)
    const safeCols = cols.length > 0 ? cols : ['Name', 'Status', 'Amount', 'Date']
    const morphology = tokens.morphology.tables

    const tableClasses = {
        dense: `${tokens.density.table} ${tokens.typography.mono}`,
        striped: `${tokens.density.table} ${tokens.typography.body}`,
        minimal: `${tokens.density.table} ${tokens.typography.body}`,
    }

    const rowClasses = {
        dense: `border-b ${tokens.tone.border} last:border-b-0 transition-colors hover:bg-[var(--color-surface-alt)]/50`,
        striped: `border-b ${tokens.tone.border} odd:bg-[var(--color-surface-alt)]/30 last:border-b-0 transition-colors hover:bg-[var(--color-surface-alt)]`,
        minimal: 'border-b border-transparent transition-colors hover:bg-[var(--color-surface-alt)]/50',
    }

    const generatedRows = Array.from({ length: 5 }, (_, i) =>
        safeCols.map((_, j) => {
            const values = [
                ['Acme Corp', 'Active', '$12,400', 'Jan 15'],
                ['Globex Inc', 'Pending', '$8,200', 'Jan 14'],
                ['Stark Industries', 'Complete', '$24,800', 'Jan 13'],
                ['Wayne Enterprises', 'Active', '$16,300', 'Jan 12'],
                ['Umbrella Corp', 'Review', '$9,750', 'Jan 11'],
            ]
            return values[i]?.[j] || `--`
        })
    )

    const safeRows = asStringRows(rows)
    const rowData = safeRows.length > 0 ? safeRows : generatedRows
    const safeTitle = asText(title)

    const statusColors: Record<string, string> = {
        active: tokens.status.successBg,
        complete: tokens.status.successBg,
        completed: tokens.status.successBg,
        success: tokens.status.successBg,
        pending: tokens.status.warningBg,
        warning: tokens.status.warningBg,
        review: tokens.status.infoBg,
        info: tokens.status.infoBg,
        error: tokens.status.errorBg,
        failed: tokens.status.errorBg,
        inactive: `bg-[var(--color-surface-alt)] ${tokens.tone.muted}`,
    }

    function cellContent(cell: string, colIdx: number) {
        const lower = cell.toLowerCase()
        if (colIdx > 0 && statusColors[lower]) {
            return (
                <span className={`inline-flex items-center gap-1 ${tokens.shape.badge} px-2 py-0.5 text-[11px] font-medium ${statusColors[lower]}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {cell}
                </span>
            )
        }
        if (cell.startsWith('$') || cell.startsWith('-$') || cell.match(/^\d[\d,.]+%?$/)) {
            return <span className={tokens.typography.mono}>{cell}</span>
        }
        return cell
    }

    return (
        <AnimateIn>
            <div className={`${tokens.tone.card} ${tokens.shape.card} ${tokens.tone.shadow} overflow-hidden`}>
                {safeTitle && (
                    <div className={`${tokens.density.card} flex items-center gap-2 ${morphology === 'minimal' ? '' : `border-b ${tokens.tone.border}`}`}>
                        {icon && <IconElement name={icon} size={16} className={tokens.tone.muted} />}
                        <h3 className={`${tokens.typography.subheading} ${tokens.tone.text}`}>{safeTitle}</h3>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className={`w-full ${morphology === 'dense' ? 'table-fixed' : ''}`}>
                        <thead>
                            <tr className={morphology === 'minimal' ? '' : `border-b ${tokens.tone.border}`}>
                                {safeCols.map((col, i) => (
                                    <th
                                        key={i}
                                        className={`${tableClasses[morphology]} ${tokens.typography.label} ${tokens.tone.muted} text-left`}
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rowData.map((row, i) => (
                                <tr key={i} className={rowClasses[morphology]}>
                                    {row.map((cell, j) => (
                                        <td
                                            key={j}
                                            className={`${tableClasses[morphology]} ${j === 0 ? `${tokens.tone.text} font-medium` : tokens.tone.text}`}
                                        >
                                            {cellContent(cell, j)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AnimateIn>
    )
}
