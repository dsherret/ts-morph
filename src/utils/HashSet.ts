export function createHashSet<T>(): HashSet<T> {
    if (typeof Set !== "undefined")
        return new Set<T>();
    return new Es5HashSet<T>();
}

export interface HashSet<T> {
    has(value: T): boolean;
    clear(): void;
    delete(value: T): boolean;
    add(value: T): void;
    values(): IterableIterator<T>;
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

    delete(value: T) {
        const index = this.items.indexOf(value);
        if (index === -1)
            return false;
        this.items.splice(index, 1);
        return true;
    }

    clear() {
        this.items.length = 0;
    }

    *values() {
        for (const item of this.items)
            yield item;
    }
}
