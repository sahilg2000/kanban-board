export function reindexBy<T extends Record<K, number>, K extends keyof T>(
    items: ReadonlyArray<T>,
    key: K
): T[] {
    return items.map((item, i) => ({ ...item, [key]: i }));
}

export function reindex<T extends { position: number }>(
    items: ReadonlyArray<T>
): T[] {
    return reindexBy(items, "position");
}
