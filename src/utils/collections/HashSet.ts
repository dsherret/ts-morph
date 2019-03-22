export interface HashSet<T> {
    has(value: T): boolean;
    clear(): void;
    delete(value: T): boolean;
    add(value: T): void;
    values(): IterableIterator<T>;
}
