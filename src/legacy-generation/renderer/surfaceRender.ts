import type { InterfaceSurface } from '../../types/pipeline'

export const SURFACE_RENDER: Record<InterfaceSurface, { w: number; h: number }> = {
    marketing: { w: 1280, h: 800 },
    analytical: { w: 1440, h: 900 },
    mobile: { w: 390, h: 844 },
    workspace: { w: 1440, h: 900 },
    immersive: { w: 1280, h: 720 },
}

export function surfaceAspectRatio(surface: InterfaceSurface): string {
    const { w, h } = SURFACE_RENDER[surface]
    return `${w}/${h}`
}
