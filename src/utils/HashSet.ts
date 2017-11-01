export function createHashSet<T>(): HashSet<T> {
    if (typeof Set !== "undefined")
        return new Set<T>();
    return new Es5HashSet<T>();
}

export interface HashSet<T> {
    has(value: T): boolean;
    add(value: T): void;
}

export class Es5HashSet<T> implements HashSet<T> {
    private readonly items: T[] = [];

    has(value: T) {
        // slow and O(n)...
        return this.items.indexOf(value) >= 0;
    }

    add(value: T) {
        if (!this.has(value))
            this.items.push(value);
    }
}
