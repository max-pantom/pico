import React from 'react'
import { motion } from 'framer-motion'
import type { ResolvedTokens } from '../../types/pipeline'

interface Props {
    tokens: ResolvedTokens
    children: React.ReactNode
}

export function Shell({ tokens, children }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`${tokens.colors.surfaceBg} ${tokens.layout.wrapper}`}
        >
            {children}
        </motion.div>
    )
}
