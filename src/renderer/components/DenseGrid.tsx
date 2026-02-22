import React from 'react'
import type { ResolvedTokens } from '../../types/pipeline'

interface Props {
    tokens: ResolvedTokens
    children?: React.ReactNode
}

export function DenseGrid({ children }: Props) {
    return (
        <section className="grid min-h-full grid-cols-1 gap-4 p-4 md:grid-cols-6 lg:grid-cols-12">
            {children}
        </section>
    )
}
