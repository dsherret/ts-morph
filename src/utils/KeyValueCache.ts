interface KeyValueCacheItem<T, U> {
    key: T;
    value: U;
}

export class KeyValueCache<T, U> {
    private readonly cacheItems: KeyValueCacheItem<T, U>[] = [];

    getOrCreate<TCreate extends U>(key: T, createFunc: () => TCreate) {
        let item = this.get(key) as TCreate;

        if (item == null) {
            item = createFunc();
            this.set(key, item);
        }

        return item;
    }

    get(key: T) {
        // todo: make this O(1) somehow
        for (let cacheItem of this.cacheItems) {
            if (cacheItem.key === key) {
                return cacheItem.value;
            }
        }

        return null;
    }

    set(key: T, value: U) {
        for (let cacheItem of this.cacheItems) {
            if (cacheItem.key === key) {
                cacheItem.value = value;
                return;
            }
        }

        this.cacheItems.push({ key, value });
    }

    replaceKey(key: T, newKey: T) {
        for (let cacheItem of this.cacheItems) {
            if (cacheItem.key === key) {
                cacheItem.key = newKey;
                return;
            }
        }

        throw new Error("Key not found.");
    }
}
