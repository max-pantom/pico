import type { ResolvedTokens } from '../../types/pipeline'
import { asStringArray, asText } from '../safeValue'
import { IconElement } from './IconElement'

interface Props {
    tokens: ResolvedTokens
    brand?: string
    links?: string[]
}

export function FooterSection({ tokens, brand = 'Product', links = [] }: Props) {
    const safeLinks = asStringArray(links)

    return (
        <footer className={`border-t ${tokens.tone.border} pt-8 pb-4`}>
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className={`flex h-7 w-7 items-center justify-center ${tokens.shape.button} ${tokens.gradient.primary}`}>
                            <IconElement name="sparkles" size={14} className="text-white" />
                        </div>
                        <span className={`${tokens.typography.subheading} ${tokens.tone.text}`}>{asText(brand, 'Product')}</span>
                    </div>
                    <p className={`${tokens.typography.micro} ${tokens.tone.muted} max-w-xs`}>
                        Building the future, one pixel at a time.
                    </p>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {safeLinks.map((link, index) => (
                        <span key={`${link}-${index}`} className={`${tokens.typography.body} ${tokens.tone.muted} transition-colors hover:${tokens.tone.text} cursor-pointer`}>
                            {link}
                        </span>
                    ))}
                </div>
            </div>
            <div className={`mt-8 pt-4 border-t ${tokens.tone.border} flex items-center justify-between`}>
                <p className={`${tokens.typography.micro} ${tokens.tone.muted}`}>
                    &copy; {new Date().getFullYear()} {asText(brand, 'Product')}. All rights reserved.
                </p>
                <div className="flex gap-3">
                    {['globe', 'message', 'mail'].map((iconName) => (
                        <button key={iconName} className={`p-1.5 ${tokens.tone.muted} hover:${tokens.tone.text} transition-colors`}>
                            <IconElement name={iconName} size={16} />
                        </button>
                    ))}
                </div>
            </div>
        </footer>
    )
}
