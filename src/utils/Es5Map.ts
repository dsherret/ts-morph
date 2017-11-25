export interface Dictionary<T, U> {
    get(key: T): U | undefined;
    set(key: T, value: U): void;
    has(key: T): boolean;
    delete(key: T): void;
    entries(): IterableIterator<[T, U]>;
}

export class Es5Map<T, U> implements Dictionary<T, U> {
    private readonly items: { [identifier: string]: [T, U]; } = {};
    private readonly propName = `__key_${Es5Map.instanceCount++}`;
    private itemCount = 0;

    private static instanceCount = 0;

    set(key: T, value: U) {
        const identifier = this.getIdentifier(key) || this.createIdentifier(key);
        this.items[identifier] = [key, value];
    }

    get(key: T) {
        const identifier = this.getIdentifier(key);
        if (identifier == null)
            return undefined;
        const keyValue = this.items[identifier];
        if (keyValue == null)
            return undefined;
        return keyValue[1];
    }

    has(key: T) {
        const identifier = this.getIdentifier(key);
        if (identifier == null)
            return false;
        return this.items.hasOwnProperty(identifier);
    }

    delete(key: T) {
        const identifier = this.getIdentifier(key);
        if (identifier != null)
            delete this.items[identifier];
    }

    *entries() {
        for (const key of Object.keys(this.items))
            yield this.items[key];
    }

    private getIdentifier(key: T) {
        if (typeof key === "string")
            return key;
        return (key as any)[this.propName] as string | undefined;
    }

    private createIdentifier(key: T) {
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
