import React from 'react'
import type { ResolvedTokens } from '../../types/pipeline'
import { asStringArray, asStringRows, asText } from '../safeValue'

interface Props {
    tokens: ResolvedTokens
    title?: string
    columns?: string[]
    rows?: string[][]
    children?: React.ReactNode
}

export function DataTable({ tokens, title, columns, rows }: Props) {
    const cols = asStringArray(columns)
    const safeCols = cols.length > 0 ? cols : ['Column 1', 'Column 2', 'Column 3']
    const morphology = tokens.morphology.tables

    const tableClasses = {
        dense: `${tokens.density.table} ${tokens.typography.micro}`,
        striped: `${tokens.density.table} ${tokens.typography.body}`,
        minimal: `${tokens.density.table} ${tokens.typography.body}`,
    }

    const rowClasses = {
        dense: `border-b ${tokens.tone.border} last:border-b-0`,
        striped: `border-b ${tokens.tone.border} odd:bg-white/5 last:border-b-0`,
        minimal: 'border-b border-transparent hover:bg-white/5',
    }

    const generatedRows = Array.from({ length: 5 }, (_, i) =>
        safeCols.map((_, j) => {
            const values = [
                ['Active', 'Dr. Smith', '12:30 PM', 'High', '4.2'],
                ['Pending', 'J. Doe', '1:15 PM', 'Medium', '3.8'],
                ['Complete', 'A. Johnson', '2:00 PM', 'Low', '5.0'],
                ['Active', 'M. Williams', '3:45 PM', 'High', '4.7'],
                ['Review', 'S. Brown', '4:30 PM', 'Medium', '3.5'],
            ]
            return values[i]?.[j] || `Row ${i + 1}`
        })
    )

    const safeRows = asStringRows(rows)
    const rowData = safeRows.length > 0 ? safeRows : generatedRows
    const safeTitle = asText(title)

    return (
        <div className={`${tokens.tone.card} ${tokens.shape.card} ${tokens.tone.shadow} overflow-hidden transition-shadow duration-300 hover:shadow-md`}>
            {safeTitle && (
                <div className={`${tokens.density.card} ${morphology === 'minimal' ? '' : `border-b ${tokens.tone.border}`}`}>
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
                                        className={`${tableClasses[morphology]} ${tokens.tone.text}`}
                                    >
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
