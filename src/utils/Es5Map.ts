export interface Dictionary<K, V> {
    get(key: K): V | undefined;
    set(key: K, value: V): void;
    has(key: K): boolean;
    delete(key: K): void;
    entries(): IterableIterator<[K, V]>;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
}

export class Es5Map<K, V> implements Dictionary<K, V> {
    private readonly items: { [identifier: string]: [K, V]; } = {};
    private readonly propName = `__key_${Es5Map.instanceCount++}`;
    private itemCount = 0;

    private static instanceCount = 0;

    set(key: K, value: V) {
        const identifier = this.getIdentifier(key) || this.createIdentifier(key);
        this.items[identifier] = [key, value];
    }

    get(key: K) {
        const identifier = this.getIdentifier(key);
        if (identifier == null)
            return undefined;
        const keyValue = this.items[identifier];
        if (keyValue == null)
            return undefined;
        return keyValue[1];
    }

    has(key: K) {
        const identifier = this.getIdentifier(key);
        if (identifier == null)
            return false;
        return this.items.hasOwnProperty(identifier);
    }

    delete(key: K) {
        const identifier = this.getIdentifier(key);
        if (identifier != null)
            delete this.items[identifier];
    }

    *entries() {
        for (const key of Object.keys(this.items))
            yield this.items[key];
    }

    *keys() {
        for (const entry of this.entries())
            yield entry[0];
    }

    *values() {
        for (const entry of this.entries())
            yield entry[1];
    }

    private getIdentifier(key: K) {
        if (typeof key === "string")
            return key;
        return (key as any)[this.propName] as string | undefined;
    }

    private createIdentifier(key: K) {
        if (typeof key === "string")
            return key;

        const identifier = (this.itemCount++).toString();
        Object.defineProperty(key, this.propName, {
            configurable: false,
            enumerable: false,
            writable: false,
            value: identifier
        });
        return identifier;
    }
}
