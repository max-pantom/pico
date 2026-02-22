export function asText(value: unknown, fallback = ''): string {
    if (typeof value === 'string') return value
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    if (value == null) return fallback

    try {
        return JSON.stringify(value)
    } catch {
        return fallback
    }
}

export function asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return []
    return value.map((item) => asText(item)).filter((item) => item.length > 0)
}

export function asStringRows(value: unknown): string[][] {
    if (!Array.isArray(value)) return []

    return value
        .map((row) => {
            if (!Array.isArray(row)) return [asText(row)]
            return row.map((cell) => asText(cell))
        })
        .filter((row) => row.length > 0)
}
