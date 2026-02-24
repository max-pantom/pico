export function asText(value: unknown, fallback = ''): string {
    if (typeof value === 'string') return value
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    return fallback
}

export function asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return []
    return value
        .filter((item): item is string | number | boolean =>
            typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean')
        .map((item) => String(item))
        .filter((item) => item.length > 0)
}

export function asStringRows(value: unknown): string[][] {
    if (!Array.isArray(value)) return []

    return value
        .filter(Array.isArray)
        .map((row) => (row as unknown[]).map((cell) => asText(cell)))
        .filter((row) => row.some((cell) => cell.length > 0))
}
