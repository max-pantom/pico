import type { ResolvedTokens } from '../../types/pipeline'
import { asStringArray, asText } from '../safeValue'

interface Props {
    tokens: ResolvedTokens
    title?: string
    projects?: string[]
}

export function WorkGrid({ tokens, title = 'Selected Work', projects = [] }: Props) {
    const safeProjects = asStringArray(projects)

    return (
        <section className="space-y-4">
            <h2 className={`${tokens.typography.subheading} ${tokens.tone.text}`}>{asText(title, 'Selected Work')}</h2>
            <div className="grid gap-5 md:grid-cols-2">
                {safeProjects.map((project, index) => (
                    <article key={`${project}-${index}`} className={`${tokens.shape.card} border ${tokens.tone.border} ${tokens.tone.card} overflow-hidden`}>
                        <div className="aspect-[4/3] w-full bg-gradient-to-br from-[var(--color-primary)]/20 via-[var(--color-accent)]/15 to-transparent" />
                        <div className="p-[var(--spacing-card)]">
                            <p className={`${tokens.typography.subheading} ${tokens.tone.text}`}>{project}</p>
                            <p className={`${tokens.typography.body} ${tokens.tone.muted} mt-2`}>
                                Case study, process, and outcomes with strong visual emphasis.
                            </p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}
