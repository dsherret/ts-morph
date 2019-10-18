/**
 * Helper around a Map.
 * @remarks The use of this class is historical as it served as an abstraction around an ES5 based map and ES6, if available. Eventually
 * this class should be removed in favour of helper functions around a Map.
 */
export class KeyValueCache<T, U> {
    private readonly cacheItems = new Map<T, U>();

    getSize() {
        return this.cacheItems.size;
    }

    getValues() {
        return this.cacheItems.values();
    }

    getValuesAsArray() {
        return Array.from(this.getValues());
    }

    getKeys() {
        return this.cacheItems.keys();
    }

    getEntries() {
        return this.cacheItems.entries();
    }

    getOrCreate<TCreate extends U = U>(key: T, createFunc: () => TCreate) {
        let item = this.get(key) as TCreate;

        if (item == null) {
            item = createFunc();
            this.set(key, item);
        }

        return item;
    }

    has(key: T) {
        return this.cacheItems.has(key);
    }

    get(key: T) {
        return this.cacheItems.get(key);
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

    clear() {
        this.cacheItems.clear();
    }
}
