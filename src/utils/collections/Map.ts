export interface ReadonlyMap<K, V> {
    readonly size: number;
    get(key: K): V | undefined;
    has(key: K): boolean;
    entries(): IterableIterator<[K, V]>;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
}

export interface Map<K, V> extends ReadonlyMap<K, V> {
    set(key: K, value: V): void;
    delete(key: K): void;
    clear(): void;
}
