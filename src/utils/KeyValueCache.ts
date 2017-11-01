export class KeyValueCache<T, U> {
    private readonly cacheItems: Dictionary<T, U>;

    constructor() {
        if (typeof Map !== undefined)
            this.cacheItems = new Map<T, U>();
        else
            this.cacheItems = new Es5Map();
    }

    getEntries() {
        return this.cacheItems.entries();
    }

    getOrCreate<TCreate extends U>(key: T, createFunc: () => TCreate) {
        let item = this.get(key) as TCreate;

        if (item == null) {
            item = createFunc();
            this.set(key, item);
        }

        return item;
    }

    get(key: T) {
        return this.cacheItems.get(key) || undefined;
    }

    set(key: T, value: U) {
        this.cacheItems.set(key, value);
    }

    replaceKey(key: T, newKey: T) {
        if (!this.cacheItems.has(key))
            throw new Error("Key not found.");
        const value = this.cacheItems.get(key)!;
        this.cacheItems.delete(key);
        this.cacheItems.set(newKey, value);
    }

    removeByKey(key: T) {
        this.cacheItems.delete(key);
    }
}

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
        return this.get(key) != null;
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
