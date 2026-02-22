import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
    children: ReactNode
    delay?: number
    className?: string
    direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}

const OFFSETS = {
    up: { y: 16 },
    down: { y: -16 },
    left: { x: 16 },
    right: { x: -16 },
    none: {},
}

export function AnimateIn({ children, delay = 0, className = '', direction = 'up' }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, ...OFFSETS[direction] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{
                duration: 0.4,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function StaggerContainer({ children, className = '' }: { children: ReactNode, className?: string }) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06 } },
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function StaggerItem({ children, className = '' }: { children: ReactNode, className?: string }) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
