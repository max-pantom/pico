import type { ResolvedTokens } from '../../../types/pipeline'
import { asStringArray, asText } from '../safeValue'
import { IconElement } from './IconElement'
import { StaggerContainer, StaggerItem } from './AnimateIn'

interface Props {
    tokens: ResolvedTokens
    title?: string
    projects?: string[]
}

const PROJECT_GRADIENTS = [
    'from-[var(--color-gradient-from)]/30 via-[var(--color-gradient-via)]/20 to-transparent',
    'from-[var(--color-accent)]/25 via-[var(--color-gradient-to)]/15 to-transparent',
    'from-[var(--color-gradient-to)]/30 via-[var(--color-primary)]/20 to-transparent',
    'from-[var(--color-info)]/25 via-[var(--color-accent)]/15 to-transparent',
]

export function WorkGrid({ tokens, title = 'Selected Work', projects = [] }: Props) {
    const safeProjects = asStringArray(projects)

    return (
        <section className="space-y-6">
            <h2 className={`${tokens.typography.heading} ${tokens.tone.text}`}>{asText(title, 'Selected Work')}</h2>
            <StaggerContainer className="grid gap-5 md:grid-cols-2">
                {safeProjects.map((project, index) => (
                    <StaggerItem key={`${project}-${index}`}>
                        <article className={`${tokens.shape.card} border ${tokens.tone.border} ${tokens.tone.card} overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
                            <div className={`relative aspect-[16/10] w-full bg-gradient-to-br ${PROJECT_GRADIENTS[index % PROJECT_GRADIENTS.length]}`}>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <IconElement name="image" size={24} className="text-white/60" />
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] via-transparent to-transparent opacity-60" />
                            </div>
                            <div className="p-[var(--spacing-card)]">
                                <div className="flex items-center justify-between">
                                    <p className={`${tokens.typography.subheading} ${tokens.tone.text} group-hover:${tokens.colors.accentText} transition-colors`}>{project}</p>
                                    <IconElement name="arrow-up-right" size={16} className={`${tokens.tone.muted} group-hover:${tokens.colors.accentText} transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5`} />
                                </div>
                                <p className={`${tokens.typography.body} ${tokens.tone.muted} mt-1`}>
                                    Case study exploring process, visual direction, and outcomes.
                                </p>
                            </div>
                        </article>
                    </StaggerItem>
                ))}
            </StaggerContainer>
        </section>
    )
}
