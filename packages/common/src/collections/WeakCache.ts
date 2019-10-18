/**
 * A wrapper around WeakMap.
 * @remarks The use of this class is historical as it served as an abstraction around an ES5 based weak map and ES6, if available. Eventually
 * this class should be removed in favour of helper functions around a WeakMap.
 */
export class WeakCache<T extends object, U> {
    private readonly cacheItems = new WeakMap<T, U>();

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

    removeByKey(key: T) {
        this.cacheItems.delete(key);
    }
}
