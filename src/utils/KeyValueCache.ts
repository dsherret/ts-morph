interface KeyValueCacheItem<T, U> {
    key: T;
    value: U;
}

export class KeyValueCache<T, U> {
    private readonly cacheItems = new Map<T, U>();

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
