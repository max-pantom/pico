import type { ResolvedTokens } from '../../types/pipeline'
import { asStringArray, asText } from '../safeValue'

interface Props {
    tokens: ResolvedTokens
    brand?: string
    links?: string[]
}

export function FooterSection({ tokens, brand = 'Product', links = [] }: Props) {
    const safeLinks = asStringArray(links)

    return (
        <footer className={`border-t ${tokens.tone.border} pt-4`}> 
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className={`${tokens.typography.micro} ${tokens.tone.muted}`}>{asText(brand, 'Product')}</p>
                <div className="flex flex-wrap gap-3">
                    {safeLinks.map((link, index) => (
                        <span key={`${link}-${index}`} className={`${tokens.typography.micro} ${tokens.tone.muted}`}>
                            {link}
                        </span>
                    ))}
                </div>
            </div>
        </footer>
    )
}
